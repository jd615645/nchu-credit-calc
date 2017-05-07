var vm = new Vue({
  el: '#app',
  data() {
    return {
      thresholdInfo: { major: { credit: 0, needCredit: 0, course: [] }, elective: { credit: 0, needCredit: 0, course: [] }, general: { credit: 0, needCredit: 30, course: [] }, sport: { credit: 0, needCredit: 4, course: [] } },
      otherThreshold: { service: false, english: false },
      circleOption: {animation: 1, animationStep: 5, foregroundBorderWidth: 5, backgroundBorderWidth: 1, iconColor: '#3498DB', iconSize: '40', iconPosition: 'middle'},
      activePage: 1
    }
  },
  mounted() {
    this.thresholdInfo.major.credit = 30
    this.thresholdInfo.major.needCredit = 68
    this.thresholdInfo.elective.credit = 16
    this.thresholdInfo.elective.needCredit = 32

    this.progressInit()
  },
  computed: {
    totCredit() {
      let tot = 0
      $.each(this.thresholdInfo, (key, val) => {
        tot += val.credit
      })
      return tot
    },
    totNeedCredit() {
      let tot = 0
      $.each(this.thresholdInfo, (key, val) => {
        tot += val.needCredit
      })
      return tot
    },
    navTitle() {
      if (this.activePage === 1) return '學分統計'
      else if (this.activePage === 2) return '學分統計'
      else if (this.activePage === 3) return '課表'
      else if (this.activePage === 4) return '個人資料'
    }
  },
  methods: {
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
    }
  }
})
