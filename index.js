const puppeteer = require('puppeteer')
const fs = require('fs')

const urls = [
  'https://iqga.me/base/1910/',
  'https://iqga.me/base/1892/',
  'https://iqga.me/base/1865/',
  'https://iqga.me/base/1846/',
  'https://iqga.me/base/1819/',
]

;(async function () {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  let allTasksAbove70 = []
  for (let i = 0; i < urls.length; i++) {
    await page.goto(urls[i], { waitUntil: 'networkidle2' })

    const tasks = await page.evaluate(() => {
      const capitalize = (string) =>
        string ? string.charAt(0).toUpperCase() + string.slice(1) : undefined
      return [...document.querySelectorAll('li[id^="question"]')].map(
        ($task) => {
          return {
            link:
              'https://iqga.me' +
              $task
                .querySelectorAll('p')[0]
                ?.querySelector('b > a')
                ?.getAttribute('href'),
            question: $task.querySelectorAll('p')[1].textContent,
            passPercentage: Number(
              $task
                .querySelector('small')
                .textContent.split('—')[1]
                .split('%')[0]
                .trim()
            ),
            answer: capitalize(
              $task
                .querySelectorAll('.answer > p')[0]
                ?.textContent.split('\n')[0]
                ?.split('Ответ:')[1]
                ?.trim()
            ),
            comment: capitalize(
              $task
                .querySelectorAll('.answer > p')[1]
                ?.textContent.split('Комментарий:')[1]
                ?.trim()
            ),
            source: capitalize(
              $task
                .querySelectorAll('.answer > p')[2]
                ?.textContent.split('Источник:')[1]
                ?.trim()
            ),
            author: $task
              .querySelectorAll('.answer > p')[3]
              ?.textContent.split('Автор:')[1]
              ?.trim(),
          }
        }
      )
    })

    const tasksAbove70 = tasks.filter((task) => task.passPercentage > 70)
    allTasksAbove70 = [...allTasksAbove70, ...tasksAbove70]
  }

  await browser.close()

  allTasksAbove70.sort((a, b) => b.passPercentage - a.passPercentage)

  console.log(allTasksAbove70[0])
  console.log('Total found:' + allTasksAbove70.length)

  fs.writeFileSync('result.json', JSON.stringify(allTasksAbove70))
})()
