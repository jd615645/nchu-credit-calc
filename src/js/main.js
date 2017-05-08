var vm = new Vue({
  el: '#app',
  data() {
    return {
      thresholdInfo: { major: { credit: 0, needCredit: 68, course: [] }, elective: { credit: 0, needCredit: 32, course: [] }, general: { credit: 0, needCredit: 30, course: [] }, sport: { credit: 0, needCredit: 4, course: [] }, other: { credit: 0, needCredit: 0, course: [] }},
      otherThreshold: { service: true, english: false },
      creditSummary: {},
      circleOption: {animation: 1, animationStep: 5, foregroundBorderWidth: 5, backgroundBorderWidth: 1, iconColor: '#3498DB', iconSize: '40', iconPosition: 'middle'},
      activePage: 1
    }
  },
  mounted() {
    this.getData()
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
    }
  },
  methods: {
    getData() {
      // debug
      $.getJSON('./data/list.json', (data) => {
        $.each(data, (key, val) => {
          let year = _.toString(val['學年']) + _.toString(val['學期'])
          let subject = val['所屬項目']
          if (!_.has(this.creditSummary, [year, subject])) {
            _.setWith(this.creditSummary, [year, subject], [], Object)
          }
          this.creditSummary[year][subject].push(val)
        })
        this.calcCredit()
        this.progressInit()
      })
    },
    calcCredit() {
      $.each(this.creditSummary, (ik, iv) => {
        $.each(this.creditSummary[ik], (jk, jv) => {
          $.each(this.creditSummary[ik][jk], (kk, kv) => {
            if (jk === '英文畢業門檻') {
              let english = this.otherThreshold.english
              if (kv['成績'] >= 60) {
                english = true
              }
            }
            else if (jk === '服務學習') {
              let service = this.otherThreshold.service
              if (kv['成績'] < 60) {
                service = false
              }
            } else {
              let type
              if (jk === '本系專業必修課程') {
                type = this.thresholdInfo.major
              }
              else if (jk === '本系選修課程') {
                type = this.thresholdInfo.elective
              }
              else if (jk.search('通識') !== -1 || jk === '大學國文' || jk === '大一英文') {
                type = this.thresholdInfo.general
              }else {
                type = this.thresholdInfo.other
              }

              if (kv['成績'] >= 60) {
                type.credit += kv['畢業學分']
              }
              type.course.push(kv)
            }
          })
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
    editNeedCrredit(type) {
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
          }else {
            swal.showInputError('請填寫正確數值!')
            return false
          }

          swal('修改成功', '已經將畢業' + type + '學分修改為' + caredit + '學分', 'success')
        })
    }
  }
})
