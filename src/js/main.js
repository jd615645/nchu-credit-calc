var vm = new Vue({
  el: '#app',
  data() {
    return {
      thresholdInfo: { major: { credit: 0, needCredit: 68, course: [] }, elective: { credit: 0, needCredit: 32, course: [] }, general: { credit: 0, needCredit: 30, course: [] }, sport: { credit: 0, needCredit: 4, course: [] }, other: { credit: 0, needCredit: 0, course: [] }},
      otherThreshold: { service: true, english: false },
      circleOption: {animation: 1, animationStep: 5, foregroundBorderWidth: 5, backgroundBorderWidth: 1, iconColor: '#3498DB', iconSize: '40', iconPosition: 'middle'},
      creditSummary: {},
      courseCode: {},
      subjectTitle: '',
      subjectList: [],
      activePage: -1,
      tableView: 9,
      // profile
      studentId: '',
      studentPw: '',
      studentName: '',
      studentDept: ''
    }
  },
  mounted() {
    setTimeout(() => {
      if (!_.isUndefined(window.localStorage['creditSummary'])) {
        this.activePage = 1
        this.loadStorage()
        // this.calcCredit()
        this.progressInit()
      }else {
        this.activePage = 0
      }
    }, 500)
  },
  computed: {
    totCredit() {
      let tot = 0
      _.each(this.thresholdInfo, (val) => {
        tot += val.credit
      })
      tot -= this.thresholdInfo.sport.credit
      tot -= this.thresholdInfo.other.credit
      return tot
    },
    totNeedCredit() {
      let tot = 0
      _.each(this.thresholdInfo, (val) => {
        tot += val.needCredit
      })
      tot -= this.thresholdInfo.sport.needCredit
      return tot
    },
    serviceGap() {
      if (this.otherThreshold.service) {
        return 'PASS'
      }else {
        return 'Not PASS'
      }
    },
    englishGap() {
      if (this.otherThreshold.english) {
        return 'PASS'
      }else {
        return 'Not PASS'
      }
    },
    navTitle() {
      if (this.activePage === 1) return '畢業學分統計'
      else if (this.activePage === 2) return '畢業學分列表'
      else if (this.activePage === 3) return '課表'
      else if (this.activePage === 4) return '個人資料'
      else if (this.activePage === 5) return '項目列表'
    },
    totPersent() {
      let persent = (this.totCredit / this.totNeedCredit).toFixed(2).toString()
      if (persent >= 1) persent = 1
      return persent * 100 + '%'
    },
    majorPersent() {
      let persent = (this.thresholdInfo.major.credit / this.thresholdInfo.major.needCredit).toFixed(2).toString()
      if (persent >= 1) persent = 1
      return persent * 100 + '%'
    },
    electivePersent() {
      let persent = (this.thresholdInfo.elective.credit / this.thresholdInfo.elective.needCredit).toFixed(2).toString()
      if (persent >= 1) persent = 1
      return persent * 100 + '%'
    },
    generalPersent() {
      let persent = (this.thresholdInfo.general.credit / this.thresholdInfo.general.needCredit).toFixed(2).toString()
      if (persent >= 1) persent = 1
      return persent * 100 + '%'
    },
    sportPersent() {
      let persent = (this.thresholdInfo.sport.credit / this.thresholdInfo.sport.needCredit).toFixed(2).toString()
      if (persent >= 1) persent = 1
      return persent * 100 + '%'
    }
  },
  methods: {
    getData(data) {
      _.each(data, (val) => {
        let year = _.toString(val['學年']) + _.toString(val['學期'])
        let subject = val['課程別']
        if (!_.has(this.creditSummary, [year, 'total'])) {
          _.setWith(this.creditSummary, [year, 'total'], [], Object)
        }
        if (!_.has(this.creditSummary, [year, subject])) {
          _.setWith(this.creditSummary, [year, subject], [], Object)
        }
        this.creditSummary[year]['total'].push(val)
        this.creditSummary[year][subject].push(val)
      })
      _.each(this.creditSummary, (iv, year) => {
        let credits = 0
        let getCredits = 0
        _.each(this.creditSummary[year]['total'], (jv) => {
          let credit = _.parseInt(jv['畢業學分'])
          let score = _.parseInt(jv['成績'])
          credits += credit
          if (score >= 60) {
            getCredits += credit
          }
        })

        this.creditSummary[year]['credits'] = credits
        this.creditSummary[year]['getCredits'] = getCredits
      })

      this.calcCredit()
      this.saveToStorage()
    },
    calcCredit() {
      $.each(this.creditSummary, (ik, iv) => {
        $.each(iv['total'], (jk, jv) => {
          let classification = jv['課程分類']
          let title = jv['課程名稱']

          if (title === '英文能力檢定及輔導') {
            if (jv['成績'] >= 60) {
              this.otherThreshold.english = true
            }
          }
          else if (classification === '服務學習') {
            if (jv['成績'] < 60) {
              this.otherThreshold.service = false
            }
          }else {
            let category = jv['課程別']
            let type
            if (category === '通' || classification === '大一英文' || classification === '大學國文') {
              type = this.thresholdInfo.general
            }
            else if (classification === '國防教育') {
              type = this.thresholdInfo.other
            }
            else if (category === '必') {
              type = this.thresholdInfo.major
            }
            else if (category === '選') {
              type = this.thresholdInfo.elective
            }
            else if (category === '體') {
              type = this.thresholdInfo.sport
            }else {
              type = this.thresholdInfo.other
            }

            if (jv['成績'] >= 60) {
              type.credit += _.parseInt(jv['畢業學分'])
            }
            type.course.push(jv)
          }
        })
      })
      this.progressInit()

    // this.parseCourse()
    },
    calcPercent(type) {
      let percent = 0
      let credit = 0
      let needCredit = 0

      if (type === 'tot') {
        _.each(this.thresholdInfo, (val) => {
          credit += val.credit
        })
        _.each(this.thresholdInfo, (val) => {
          needCredit += val.needCredit
        })
      } else {
        credit = this.thresholdInfo[type].credit
        needCredit = this.thresholdInfo[type].needCredit
      }

      let calcSol = credit / needCredit * 100
      if (_.isNaN(calcSol) || calcSol === 0) {
        percent = 1
      }else {
        percent = calcSol
      }
      return parseInt(percent)
    },
    progressInit() {
      setTimeout(() => {
        this.progressSetting('tot')
        $.each(this.thresholdInfo, (key, val) => {
          this.progressSetting(key)
        })
      }, 50)
    },
    progressSetting(type) {
      let icon = ''
      if (type === 'tot') icon = 'f19d'
      else if (type === 'major') icon = 'f024'
      else if (type === 'elective') icon = 'f11d'
      else if (type === 'general') icon = 'f02d'
      else if (type === 'sport') icon = 'f1e3'

      $('#' + type + ' .circle-progress').circliful({
        animation: 1,
        animationStep: 5,
        foregroundBorderWidth: 5,
        backgroundBorderWidth: 1,
        percent: 50,
        iconColor: '#3498DB',
        iconSize: '40',
        iconPosition: 'middle',
        percent: this.calcPercent(type),
        icon: icon
      })
    },
    switchPage(num) {
      if (this.activePage !== num) {
        this.activePage = num
        window.scrollTo(0, 0)
        if (num === 1) {
          this.progressInit()
        }
      }
    },
    editNeedCredit(type, event) {
      event.stopPropagation()
      swal({
        title: '修改畢業' + type + '畢業學分',
        input: 'text',
        showCancelButton: true,
        closeOnConfirm: false,
        animation: true,
        inputPlaceholder: '畢業' + type + '畢業學分'
      }).then((inputVal) => {
        let caredit = _.parseInt(inputVal)
        if (!_.isNaN(caredit)) {
          if (inputVal === false) return false

          if (!_.isNaN(caredit) && caredit > 0) {
            if (type === '必修') {
              this.thresholdInfo.major.needCredit = caredit
            }
            else if (type === '選修') {
              this.thresholdInfo.elective.needCredit = caredit
            }
            else if (type === '通識') {
              this.thresholdInfo.general.needCredit = caredit
            }
          } else {
            swal.showInputError('請填寫正確數值!')
            return false
          }

          swal('修改成功', '已經將畢業' + type + '畢業學分修改為' + caredit + '畢業學分', 'success')
        }else {
          swal('錯誤', '請填入正確數字', 'error')
        }
      })
    },
    getCourseInfo(info) {
      let html = '<ul class="courseInfo"><li>學年：' + info['學年'] + '</li><li>學期：' + info['學期'] + '</li><li>選課號碼：' + info['選課號碼'] + '</li><li>課程名稱：' + info['課程名稱'] + '</li><li>開課系所：' + info['開課系所'] + '</li><li>畢業學分：' + info['畢業學分'] + '</li><li>成績：' + info['成績'] + '</li></ul>'

      swal({
        title: '詳細資料',
        html: html
      })
    },
    showCourseList() {
      $('#totCourseList').modal()
    },
    showCourseType(type) {
      this.switchSubject(type)
      $('#courseList').modal()
    },
    showLogoutMsg() {
      swal({
        title: 'Are you sure?',
        text: '你確定要登出系統嗎',
        type: 'question',
        showCancelButton: true
      }).then(() => {
        this.logout()
      })
    },
    showCourseSetting(title, code) {
      let subjectType = {
        '必修': 'major',
        '選修': 'elective',
        '通識': 'general',
        '體育': 'sport',
        '其他': 'other'
      }
      let subjectKey = {
        'major': '必修',
        'elective': '選修',
        'general': '通識',
        'sport': '體育',
        'other': '其他'
      }
      let subject = subjectType[this.subjectTitle]
      delete subjectKey[subject]

      // inputOptions can be an object or Promise
      var inputOptions = new Promise((resolve) => {
        resolve(subjectKey)
      })
      swal({
        title: '將 ' + title + ' 移動至',
        input: 'radio',
        inputOptions: inputOptions,
        inputValidator: function (result) {
          return new Promise((resolve, reject) => {
            if (result) {
              resolve()
            } else {
              reject('You need to select something!')
            }
          })
        }
      }).then((result) => {
        let findKey = _.findKey(this.thresholdInfo[subject]['course'], {'選課號碼': _.toString(code)})

        this.thresholdInfo[result]['course'].push(this.thresholdInfo[subject]['course'][findKey])
        let score = this.thresholdInfo[subject]['course'][findKey]['成績']

        if (score >= 60) {
          this.thresholdInfo[subject]['credit'] -= this.thresholdInfo[subject]['course'][findKey]['畢業學分']
          this.thresholdInfo[result]['credit'] += this.thresholdInfo[subject]['course'][findKey]['畢業學分']
        }
        this.thresholdInfo[subject]['course'].splice(findKey, 1)
        swal({
          type: 'success',
          html: '你已經將 ' + title + ' 移動至 ' + subjectKey[result] + ' 課程'
        })
      })
    },
    showList(type) {
      this.activePage = 5
      this.switchSubject(type)
    },
    switchSubject(type) {
      this.subjectList = this.thresholdInfo[type]

      if (type === 'major') this.subjectTitle = '必修'
      else if (type === 'elective') this.subjectTitle = '選修'
      else if (type === 'general') this.subjectTitle = '通識'
      else if (type === 'sport') this.subjectTitle = '體育'
      else if (type === 'other') this.subjectTitle = '其他'
    },
    saveMoveSol() {
      swal({
        title: 'Are you sure?',
        text: '你確定要儲存搬移後的內容嗎',
        type: 'question',
        showCancelButton: true
      }).then(() => {
        this.saveToStorage()
      })
    },
    parseCourse() {
      let schedule = _.map(Array(13), () => {
        return _.map(Array(5), () => [{}, 0])
      })
      let years = _.max(_.keys(this.creditSummary))

      $.each(this.creditSummary[years]['total'], (key, val) => {
        let code = val['選課號碼']
        let course = this.courseCode[code]
        $.each(course['time_parsed'], (ik, iv) => {
          $.each(iv.time, (jk, jv) => {
            let day = iv.day
            let time = jv
            schedule[time - 1][day - 1] = course['title_parsed']['zh_TW']
          })
        })
      })
      this.timeTable = schedule
    },
    login(e) {
      e.preventDefault()
      let url = 'https://login.hsingpicking.com.tw/'
      // test
      // let url = 'http://127.0.0.1:3001/'
      let loginData = {
        'id': this.studentId,
        'pw': this.studentPw
      }

      $('#login button').fadeOut()
      $('.loading').css('opacity', 1)

      $
        .post(url, loginData, (inputData) => {
          let input = JSON.parse(inputData)
          if (inputData !== 'error' && input['studentName'] !== '') {
            this.activePage = 1

            this.studentName = input['studentName']
            this.studentDept = input['studentDept']
            this.getData(input['courseList'])
          }else {
            this.studentId = ''
            this.studentPw = ''
            sweetAlert('Oops...', '請確認學號及密碼是否正確', 'error')
          }
          $('#login button').show()
          $('.loading').css('opacity', 0)
        })
        .fail(() => {
          sweetAlert('Oops...', '可能有什麼地方出錯了，請再重新確認網路狀況再登入，如無法排除請洽粉絲專業回報問提', 'error')
          $('#login button').show()
          $('.loading').css('opacity', 0)
        })
    },
    showAbout() {
      $('#about').modal()
    },
    showDownload() {
      $('#download').modal()
    },
    logout() {
      this.activePage = 0

      this.thresholdInfo = { major: { credit: 0, needCredit: 68, course: [] }, elective: { credit: 0, needCredit: 32, course: [] }, general: { credit: 0, needCredit: 30, course: [] }, sport: { credit: 0, needCredit: 4, course: [] }, other: { credit: 0, needCredit: 0, course: [] }}
      this.otherThreshold = { service: true, english: false }
      this.creditSummary = {}

      this.studentId = ''
      this.studentPw = ''

      this.clearStorage()
    },
    saveToStorage() {
      window.localStorage['studentId'] = JSON.stringify(this.studentId)
      window.localStorage['studentName'] = JSON.stringify(this.studentName)
      window.localStorage['studentDept'] = JSON.stringify(this.studentDept)
      window.localStorage['creditSummary'] = JSON.stringify(this.creditSummary)
      window.localStorage['thresholdInfo'] = JSON.stringify(this.thresholdInfo)
      window.localStorage['otherThreshold'] = JSON.stringify(this.otherThreshold)
    },
    loadStorage() {
      this.studentId = JSON.parse(window.localStorage['studentId'])
      this.studentName = JSON.parse(window.localStorage['studentName'])
      this.studentDept = JSON.parse(window.localStorage['studentDept'])
      this.creditSummary = JSON.parse(window.localStorage['creditSummary'])
      this.thresholdInfo = JSON.parse(window.localStorage['thresholdInfo'])
      this.otherThreshold = JSON.parse(window.localStorage['otherThreshold'])
    },
    clearStorage() {
      localStorage.removeItem('studentId')
      localStorage.removeItem('studentName')
      localStorage.removeItem('studentDept')
      localStorage.removeItem('creditSummary')
      localStorage.removeItem('thresholdInfo')
      localStorage.removeItem('otherThreshold')
    }
  }
})
