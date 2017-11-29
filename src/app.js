import 'babel-polyfill'
import JSZip from 'jszip'
import faker from 'faker'
import XlsxPopulate from 'xlsx-populate'

class Excel {
  constructor(props = {}) {
    this.templateUrl = props.templateUrl ? props.templateUrl : './assets/template.xlsx'
  }

  getWorkbook() {
    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest()
      req.open('GET', this.templateUrl, true)
      req.responseType = 'arraybuffer'
      req.onreadystatechange = function () {
        if (req.readyState === 4){
          if (req.status === 200) {
            resolve(XlsxPopulate.fromDataAsync(req.response))
          } else {
            reject(`Received a ${req.status} HTTP code`)
          }
        }
      }
      req.send()
    })
  }

  async fillForm(type) {
    let workbook = await this.getWorkbook().catch(e => console.error(e.message))
    const date = new Date()
    workbook.sheet(0).cell('C2').value(this.getYYYYMMDD(date))
    workbook.sheet(0).cell('B5').value(faker.name.findName())
    workbook.sheet(0).cell('B8').value(this.getYYYYMMDD(faker.date.past(40)))

    if (type === 2) {
      for (var i = 1; i <= 10000; i++) {
        workbook.sheet(0).cell(`A${i}`).value(i)
      }
    }

    return workbook.outputAsync()
  }

  getYYYYMMDD(date) {
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
  }

  async generateBlob(type) {
    let blob = await this.fillForm(type).catch(e => console.error(e.message))
    if (type === 3) blob = await this.createZip(blob).catch(e => console.error(e.message))

    return blob
  }

  createZip(blob) {
    const zip = new JSZip()
    let files = zip.folder('excel')
    files.file('example3.xlsx', blob)

    return zip.generateAsync({ type:'blob' })
  }

  async download(type = 1) {
    document.querySelector('#startTime').innerText = new Date()

    const blob = await this.generateBlob(type)
    const filename = type !== 3 ? `example${type}.xlsx` : `example${type}.zip`

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename)
    } else {
      const url = window.URL.createObjectURL(blob)
      var a = document.createElement('a')
      document.body.appendChild(a)
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      document.querySelector('#endTime').innerText = new Date()
    }
  }
}

window.Excel = Excel