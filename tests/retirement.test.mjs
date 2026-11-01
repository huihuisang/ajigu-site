import test from "node:test";
import { execFileSync } from "node:child_process";

test("repository retirement gates reject wrong identities and incomplete validation", () => {
  execFileSync(
    "python3",
    ["-B", "-m", "unittest", "discover", "-s", "tests", "-p", "retirement_test.py"],
    {
      stdio: "pipe",
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    },
  );
});
