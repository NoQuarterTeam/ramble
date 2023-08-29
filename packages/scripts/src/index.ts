import * as fs from "fs"
import { select } from "@inquirer/prompts"
import * as path from "path"
import { exec } from "child_process"

function browseDirectory(directory: string) {
  const files = fs.readdirSync(directory)
  let choices: { name: string; value: string }[] = []
  files.forEach((file) => {
    const fullPath = path.join(directory, file)
    const stats = fs.statSync(fullPath)
    const isDirectory = stats.isDirectory()
    if (file === "index.ts") return
    if (isDirectory) {
      const dirChoices = browseDirectory(path.join(directory, file))
      choices = [...choices, ...dirChoices]
    } else {
      if (!file.endsWith(".ts")) return
      choices.push({ name: file, value: fullPath })
    }
  })
  return choices
}

const currentDirectory = path.resolve("src")
const choices = browseDirectory(currentDirectory)

async function main() {
  const answer = await select({ message: "Select a script to run", choices })
  exec(`pnpm with-env ts-node ${answer}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`)
    }
    console.log(`stdout: ${stdout}`)
  })
}
main()
