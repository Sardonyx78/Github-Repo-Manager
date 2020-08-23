import inquirer from "inquirer"
import fetch from "node-fetch"
import { config } from "dotenv"

config()

const headers = {
     authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
}

async function main() {
     const res = await fetch("https://api.github.com/user", {
          headers
     })

     if (res.status === 401) return console.error("Invalid Access Token")

     const user = await res.json()

     const answers1 = await inquirer.prompt([{
          message: `Welcome ${user.name || user.login}, which action would you like to execute ? (Press Ctrl+C to exit)`,
          type: "list",
          name: "action",
          choices: [
               "Archive",
               "Delete",
               "Make Private",
               "Make Public"
          ]
     }])

     const res_repos = await fetch("https://api.github.com/user/repos", {
          headers
     })

     let repos: any[] = await res_repos.json()

     if (answers1.action === "Make Public") repos = repos.filter(x => x.private)
     else if (answers1.action === "Make Private") repos = repos.filter(x => !x.private)
     else if (answers1.action === "Archive") repos = repos.filter(x => !x.archived)

     const answers2 = await inquirer.prompt([{
          message: `Welcome ${user.name || user.login}, which repos should be affected ? (Press Ctrl+C to exit)`,
          type: "checkbox",
          name: "action",
          choices: repos.map(x => x.full_name)
     }]);

     console.log("Please wait...");

     (<string[]>answers2.action).forEach(async x => {
          
          if (answers1.action === "Archive") {
               await fetch(`https://api.github.com/repos/${x}`, {
                    headers,
                    method: "PATCH",
                    body: JSON.stringify({
                         archived: true
                    })
               })
          } else if (answers1.action === "Make Public") {
               await fetch(`https://api.github.com/repos/${x}`, {
                    headers,
                    method: "PATCH",
                    body: JSON.stringify({
                         visibility: "public"
                    })
               })
          } else if (answers1.action === "Make Private") {
               await fetch(`https://api.github.com/repos/${x}`, {
                    headers,
                    method: "PATCH",
                    body: JSON.stringify({
                         visibility: "private"
                    })
               })
          }  else if (answers1.action === "Delete") {
               await fetch(`https://api.github.com/repos/${x}`, {
                    headers,
                    method: "DELETE"
               })
          }

     })

     console.log(`Action applied to ${answers2.action.length} repos!`)
}

main()