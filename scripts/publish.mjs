import { readFile, copyFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const targetDir = join(import.meta.dirname, "../", "publish");

const publish = async () => {
  await mkdir(targetDir, { recursive: true });

  const file = await readFile("latest.json", { encoding: "utf-8" });
  // 这里我是需要手动处理一下json 所以先读取在写入到指定目录，具体到逻辑可以完全按照您自己的想法来
  const data = JSON.parse(file);
  if (data.platforms["darwin-x86_64"]) {
    data.platforms["darwin-aarch64"] = data.platforms["darwin-x86_64"];
  }
  await writeFile(
    join(targetDir, "latest.json"),
    JSON.stringify(data, null, 2)
  );
};

publish();

