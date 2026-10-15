const readline = require('readline')
const fs = require('fs')
const path = require('path')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Enter directory path: ', (inputPath) => {
  const basePath = path.isAbsolute(inputPath) ? inputPath : path.join(__dirname, inputPath)
  let fullCodeContent = ''

  const traverseDirectory = (dir) => {
    const files = fs.readdirSync(dir)
    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        traverseDirectory(filePath)
      } else if (stat.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
        const relativePath = path.relative(__dirname, filePath)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        fullCodeContent += `// Path: ${relativePath}\n${fileContent}\n`
      }
    })
  }

  traverseDirectory(basePath)

  fs.writeFileSync('full-code.tsx', fullCodeContent)
  console.log('Concatenation completed. Check full-code.tsx.')
  rl.close()
})
