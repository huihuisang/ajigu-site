// The backdrop texture contains the same local artwork and transforms as the DOM scene.
export class GlassOrb {
  constructor(canvas, scene) {
    this.canvas=canvas; this.scene=scene;
    const gl=this.gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false});
    if(!gl) return;
    canvas.width=canvas.height=Math.min(512,Math.round(140*devicePixelRatio));
    const compile=(type,source)=>{
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}');
    const fragment=compile(gl.FRAGMENT_SHADER,`
      precision highp float;
      varying vec2 uv;
      uniform sampler2D backdrop;
      uniform float time;
      vec3 sampleScene(vec2 world){return texture2D(backdrop,vec2((world.x+310.)/620.,1.-(world.y+350.)/800.)).rgb;}
      void main(){
        vec2 p=vec2(uv.x*2.-1.,1.-uv.y*2.);
        float angle=atan(p.y,p.x);
        float boundary=.92+.024*sin(angle*3.+time*1.3)+.014*cos(angle*5.-time*.8);
        float r=length(p)/boundary;
        float mask=1.-smoothstep(.985,1.,r);
        if(mask<.001)discard;
        float z=sqrt(max(.001,1.-r*r));
        vec3 normal=normalize(vec3(p/boundary,z));
        float fresnel=pow(1.-z,3.);
        vec2 center=vec2(0.,310.);
        vec2 bend=p*70.*(.62+.35*r*r)+normal.xy*10.*sin(time*.7+r*6.);
        vec2 dispersion=normal.xy*(1.+5.*fresnel);
        vec3 color=vec3(sampleScene(center+bend+dispersion).r,sampleScene(center+bend).g,sampleScene(center+bend-dispersion).b);
        vec3 light=normalize(vec3(-.55,-.65,.65));
        float highlight=pow(max(dot(normal,light),0.),65.);
        float rim=pow(1.-z,7.);
        color=mix(color,vec3(.58,.72,.82),fresnel*.27);
        color+=highlight*.7+rim*.3;
        color+=vec3(.13,.08,.02)*pow(max(dot(normal,normalize(vec3(.6,.7,.2))),0.),18.)*.5;
        gl_FragColor=vec4(color,mask);
      }
    `);
    this.program=gl.createProgram();gl.attachShader(this.program,vertex);gl.attachShader(this.program,fragment);gl.linkProgram(this.program);
    gl.deleteShader(vertex);gl.deleteShader(fragment);
    if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
    gl.useProgram(this.program);
    this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const attribute=gl.getAttribLocation(this.program,'position');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
    this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    this.time=gl.getUniformLocation(this.program,'time');
    this.source=document.createElement('canvas');this.source.width=620;this.source.height=800;this.context=this.source.getContext('2d');
    canvas.parentElement.classList.add('shader-ready');
  }
  draw(time){
    const gl=this.gl;if(!gl||!this.context||gl.isContextLost())return;
    const ctx=this.context;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#eee9df';ctx.fillRect(0,0,620,800);
    this.scene.querySelectorAll('.balloon-material').forEach(element=>{
      const image=element.querySelector('img');if(!image.complete||!image.naturalWidth)return;
      const style=getComputedStyle(element),matrix=new DOMMatrix(style.transform);
      const w=element.offsetWidth,h=element.offsetHeight;
      const scale=Math.min(w/image.naturalWidth,h/image.naturalHeight),iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;
      ctx.save();ctx.globalAlpha=Number(style.opacity);ctx.translate(310+parseFloat(style.marginLeft||0)+w/2,350+h/2);
      ctx.transform(matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f);ctx.translate(-w/2,-h/2);
      ctx.drawImage(image,(w-iw)/2,(h-ih)/2,iw,ih);ctx.restore();
    });
    gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.source);
    gl.uniform1f(this.time,time/1000);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  dispose(){if(this.gl){this.gl.deleteTexture(this.texture);this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);}}
}
