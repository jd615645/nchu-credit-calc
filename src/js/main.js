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
      activePage: 0,
      tableView: 9,
      studentId: '',
      studentPw: '',
      studentName: ''
    }
  },
  mounted() {
    // 學士班->U, 碩班->G, 夜校->N, 其他->O
    let careerType = ['U', 'G', 'N', 'O']
    let careerRequest = []

    $.each(careerType, (key, val) => {
      careerRequest.push($.getJSON('../data/career_' + val + '.json'))
    })
    $.when
      .apply($, careerRequest)
      .then((...careerData) => {
        $.each(careerData, (ik, iv) => {
          $.each(iv[0]['course'], (jk, course) => {
            _.setWith(this.courseCode, [course.code], course, Object)
          })
        })
      })

  // // debug loading
  // if (!_.isUndefined(window.localStorage['creditSummary'])) {
  //   this.creditSummary = JSON.parse(window.localStorage['creditSummary'])
  // }else {
  //   this.getDataDebug()
  // }
  // this.calcCredit()
  // setTimeout(() => {
  //   this.progressInit()
  // }, 50)
  },
  computed: {
    totCredit() {
      let tot = 0
      $.each(this.thresholdInfo, (key, val) => {
        tot += val.credit
      })
      tot -= this.thresholdInfo.sport.credit
      tot -= this.thresholdInfo.other.credit
      return tot
    },
    totNeedCredit() {
      let tot = 0
      $.each(this.thresholdInfo, (key, val) => {
        tot += val.needCredit
      })
      tot -= this.thresholdInfo.sport.needCredit
      return tot
    },
    navTitle() {
      if (this.activePage === 1) return '學分統計'
      else if (this.activePage === 2) return '學分列表'
      else if (this.activePage === 3) return '課表'
      else if (this.activePage === 4) return '個人資料'
      else if (this.activePage === 5) return '項目列表'
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
      return schedule
    }
  },
  methods: {
    getDataDebug() {
      $.getJSON('../data/list.json', (inputData) => {
        $.each(inputData, (key, val) => {
          let year = _.toString(val['學年']) + _.toString(val['學期'])
          let subject = val['所屬項目']
          if (!_.has(this.creditSummary, [year, 'total'])) {
            _.setWith(this.creditSummary, [year, 'total'], [], Object)
          }
          if (!_.has(this.creditSummary, [year, subject])) {
            _.setWith(this.creditSummary, [year, subject], [], Object)
          }
          this.creditSummary[year]['total'].push(val)
          this.creditSummary[year][subject].push(val)
        })
        this.calcCredit()
        setTimeout(() => {
          this.progressInit()
        }, 50)
        this.saveToStorage()
      })
    },
    getData(data) {
      console.log(data)
      $.each(data, (key, val) => {
        let year = _.toString(val['學年']) + _.toString(val['學期'])
        let subject = val['所屬項目']
        if (!_.has(this.creditSummary, [year, 'total'])) {
          _.setWith(this.creditSummary, [year, 'total'], [], Object)
        }
        if (!_.has(this.creditSummary, [year, subject])) {
          _.setWith(this.creditSummary, [year, subject], [], Object)
        }
        this.creditSummary[year]['total'].push(val)
        this.creditSummary[year][subject].push(val)

        this.saveToStorage()
      })
    },
    calcCredit() {
      $.each(this.creditSummary, (ik, iv) => {
        $.each(iv['total'], (jk, jv) => {
          let project = jv['所屬項目']

          if (project === '英文畢業門檻') {
            let english = this.otherThreshold.english
            if (jv['成績'] >= 60) {
              english = true
            }
          }
          else if (project === '服務學習') {
            let service = this.otherThreshold.service
            if (jv['成績'] < 60) {
              service = false
            }
          } else {
            let type
            if (project === '本系專業必修課程') {
              type = this.thresholdInfo.major
            }
            else if (project === '本系選修課程') {
              type = this.thresholdInfo.elective
            }
            else if (project === '體育') {
              type = this.thresholdInfo.sport
            }
            else if (project.search('通識') !== -1 || project === '大學國文' || project === '大一英文') {
              type = this.thresholdInfo.general
            }else {
              type = this.thresholdInfo.other
            }

            if (jv['成績'] >= 60) {
              type.credit += jv['畢業學分']
            }
            type.course.push(jv)
          }
        })
      })
    },
    calcPercent(type) {
      let percent = 0
      let credit = 0
      let needCredit = 0

      if (type === 'tot') {
        $.each(this.thresholdInfo, (key, val) => {
          credit += val.credit
        })
        $.each(this.thresholdInfo, (key, val) => {
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
      this.progressSetting('tot')
      $.each(this.thresholdInfo, (key, val) => {
        this.progressSetting(key)
      })
    },
    progressSetting(type) {
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
        setTimeout(() => {
          if (num === 1) this.progressInit()
        }, 50)
      }
    },
    editNeedCrredit(type, event) {
      event.stopPropagation()
      swal({
        title: '修改畢業' + type + '學分',
        type: 'input',
        showCancelButton: true,
        closeOnConfirm: false,
        animation: 'slide-from-top',
        inputPlaceholder: '畢業' + type + '學分'
      },
        (inputVal) => {
          let caredit = parseInt(inputVal)

          if (inputVal === false) return false

          if (!_.isNaN(caredit) && caredit > 0) {
            if (type === '必修') {
              this.thresholdInfo.major.needCredit = caredit
            }
            else if (type === '選修') {
              this.thresholdInfo.elective.needCredit = caredit
            }
          } else {
            swal.showInputError('請填寫正確數值!')
            return false
          }

          swal('修改成功', '已經將畢業' + type + '學分修改為' + caredit + '學分', 'success')
        })
    },
    getCourseInfo(info) {
      let code = parseInt(info['選課號碼'])

      let html = '<ul class="courseInfo"><li>學年：' + info['學年'] + '</li><li>學期：' + info['學期'] + '</li><li>選課號碼：' + code + '</li><li>課程名稱：' + info['課程名稱'] + '</li><li>開課系所：' + info['開課系所'] + '</li><li>授課教師：' + this.courseCode[code]['professor'] + '</li><li>學分：' + info['畢業學分'] + '</li><li>成績：' + info['成績'] + '</li><li>所屬項目：' + info['所屬項目'] + '</li></ul>'

      swal({
        title: '詳細資料',
        text: html,
        html: true
      })
    },
    showList(type) {
      this.activePage = 5
      this.subjectList = this.thresholdInfo[type]

      if (type === 'major') this.subjectTitle = '必修'
      else if (type === 'elective') this.subjectTitle = '選修'
      else if (type === 'general') this.subjectTitle = '通識'
      else if (type === 'sport') this.subjectTitle = '體育'
    },
    login(e) {
      e.preventDefault()
      let url = 'https://login.hsingpicking.com.tw/'
      let loginData = {
        'id': this.studentId,
        'pw': this.studentPw
      }

      $.post(url, loginData, (inputData) => {
        if (inputData !== 'error') {
          this.activePage = 1
          if (!_.isUndefined(window.localStorage['creditSummary'])) {
            this.creditSummary = JSON.parse(window.localStorage['creditSummary'])
          }else {
            console.log(inputData)
            let input = JSON.parse(inputData)
            console.log(input)
            this.studentName = input['studentName']
            this.getData(input['courseList'])
          }
          this.calcCredit()
          setTimeout(() => {
            this.progressInit()
          }, 50)

          $('#login button').show()
          $('.loading').css('opacity', 0)
        }else {
          sweetAlert('Oops...', '請確認學號及密碼是否正確', 'error')
        }
      })
    },
    logout() {
      this.activePage = 0
      this.clearStorage()

      this.thresholdInfo = { major: { credit: 0, needCredit: 68, course: [] }, elective: { credit: 0, needCredit: 32, course: [] }, general: { credit: 0, needCredit: 30, course: [] }, sport: { credit: 0, needCredit: 4, course: [] }, other: { credit: 0, needCredit: 0, course: [] }}
      this.otherThreshold = { service: true, english: false }
      this.creditSummary = {}
    },
    loading() {
      $('#login button').fadeOut()
      $('.loading').css('opacity', 1)
    },
    saveToStorage() {
      window.localStorage['creditSummary'] = JSON.stringify(this.creditSummary)
    },
    clearStorage() {
      localStorage.removeItem('creditSummary')
    }
  }
})
