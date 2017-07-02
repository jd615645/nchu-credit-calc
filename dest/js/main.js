'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var vm = new Vue({
  el: '#app',
  data: function data() {
    return {
      thresholdInfo: { major: { credit: 0, needCredit: 68, course: [] }, elective: { credit: 0, needCredit: 32, course: [] }, general: { credit: 0, needCredit: 30, course: [] }, sport: { credit: 0, needCredit: 4, course: [] }, other: { credit: 0, needCredit: 0, course: [] } },
      otherThreshold: { service: true, english: false },
      circleOption: { animation: 1, animationStep: 5, foregroundBorderWidth: 5, backgroundBorderWidth: 1, iconColor: '#3498DB', iconSize: '40', iconPosition: 'middle' },
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
    };
  },
  mounted: function mounted() {
    var _this = this;

    // 學士班->U, 碩班->G, 夜校->N, 其他->O
    // let careerType = ['U', 'G', 'N', 'O']
    // let careerRequest = []
    setTimeout(function () {
      if (!_.isUndefined(window.localStorage['creditSummary'])) {
        _this.activePage = 1;
        _this.loadStorage();
        // this.calcCredit()
        _this.progressInit();
      } else {
        _this.activePage = 0;
      }
    }, 500);

    // this.timeTable = _.map(Array(13), () => {
    //   return _.map(Array(5), () => [{}, 0])
    // })

    // $.each(careerType, (key, val) => {
    //   careerRequest.push($.getJSON('../data/career_' + val + '.json'))
    // })
    // $.when
    //   .apply($, careerRequest)
    //   .then((...careerData) => {
    //     $.each(careerData, (ik, iv) => {
    //       $.each(iv[0]['course'], (jk, course) => {
    //         _.setWith(this.courseCode, [course.code], course, Object)
    //       })
    //     })

    //     if (!_.isUndefined(window.localStorage['creditSummary'])) {
    //       this.activePage = 1
    //       this.creditSummary = JSON.parse(window.localStorage['creditSummary'])

    //       this.calcCredit()
    //       this.progressInit()
    //     }else {
    //       this.activePage = 0
    //     }
    //   })
  },

  computed: {
    totCredit: function totCredit() {
      var tot = 0;
      _.each(this.thresholdInfo, function (val) {
        tot += val.credit;
      });
      tot -= this.thresholdInfo.sport.credit;
      tot -= this.thresholdInfo.other.credit;
      return tot;
    },
    totNeedCredit: function totNeedCredit() {
      var tot = 0;
      _.each(this.thresholdInfo, function (val) {
        tot += val.needCredit;
      });
      tot -= this.thresholdInfo.sport.needCredit;
      return tot;
    },
    serviceGap: function serviceGap() {
      if (this.otherThreshold.service) {
        return 'PASS';
      } else {
        return 'Not PASS';
      }
    },
    englishGap: function englishGap() {
      if (this.otherThreshold.english) {
        return 'PASS';
      } else {
        return 'Not PASS';
      }
    },
    navTitle: function navTitle() {
      if (this.activePage === 1) return '學分統計';else if (this.activePage === 2) return '學分列表';else if (this.activePage === 3) return '課表';else if (this.activePage === 4) return '個人資料';else if (this.activePage === 5) return '項目列表';
    },
    totPersent: function totPersent() {
      var persent = (this.totCredit / this.totNeedCredit).toFixed(2).toString();
      if (persent >= 1) persent = 1;
      return persent * 100 + '%';
    },
    majorPersent: function majorPersent() {
      var persent = (this.thresholdInfo.major.credit / this.thresholdInfo.major.needCredit).toFixed(2).toString();
      if (persent >= 1) persent = 1;
      return persent * 100 + '%';
    },
    electivePersent: function electivePersent() {
      var persent = (this.thresholdInfo.elective.credit / this.thresholdInfo.elective.needCredit).toFixed(2).toString();
      if (persent >= 1) persent = 1;
      return persent * 100 + '%';
    },
    generalPersent: function generalPersent() {
      var persent = (this.thresholdInfo.general.credit / this.thresholdInfo.general.needCredit).toFixed(2).toString();
      if (persent >= 1) persent = 1;
      return persent * 100 + '%';
    },
    sportPersent: function sportPersent() {
      var persent = (this.thresholdInfo.sport.credit / this.thresholdInfo.sport.needCredit).toFixed(2).toString();
      if (persent >= 1) persent = 1;
      return persent * 100 + '%';
    }
  },
  methods: {
    getData: function getData(data) {
      var _this2 = this;

      _.each(data, function (val) {
        var year = _.toString(val['學年']) + _.toString(val['學期']);
        var subject = val['所屬項目'];
        if (!_.has(_this2.creditSummary, [year, 'total'])) {
          _.setWith(_this2.creditSummary, [year, 'total'], [], Object);
        }
        if (!_.has(_this2.creditSummary, [year, subject])) {
          _.setWith(_this2.creditSummary, [year, subject], [], Object);
        }
        _this2.creditSummary[year]['total'].push(val);
        _this2.creditSummary[year][subject].push(val);
      });
      _.each(this.creditSummary, function (iv, year) {
        var credits = 0;
        var getCredits = 0;
        _.each(_this2.creditSummary[year]['total'], function (jv) {
          var credit = jv['畢業學分'];
          var score = jv['成績'];
          credits += credit;
          if (score >= 60) {
            getCredits += credit;
          }
        });
        _this2.creditSummary[year]['credits'] = credits;
        _this2.creditSummary[year]['getCredits'] = getCredits;
      });

      this.calcCredit();
      this.saveToStorage();
    },
    calcCredit: function calcCredit() {
      var _this3 = this;

      $.each(this.creditSummary, function (ik, iv) {
        $.each(iv['total'], function (jk, jv) {
          var project = jv['所屬項目'];

          if (project === '英文畢業門檻') {
            if (jv['成績'] >= 60) {
              _this3.otherThreshold.english = true;
            }
          } else if (project === '服務學習') {
            if (jv['成績'] < 60) {
              _this3.otherThreshold.service = false;
            }
          } else {
            var type = void 0;
            if (project === '本系專業必修課程') {
              type = _this3.thresholdInfo.major;
            } else if (project === '本系選修課程') {
              type = _this3.thresholdInfo.elective;
            } else if (project === '體育') {
              type = _this3.thresholdInfo.sport;
            } else if (project.search('通識') !== -1 || project === '大學國文' || project === '大一英文') {
              type = _this3.thresholdInfo.general;
            } else {
              type = _this3.thresholdInfo.other;
            }

            if (jv['成績'] >= 60) {
              type.credit += jv['畢業學分'];
            }
            type.course.push(jv);
          }
        });
      });
      this.progressInit();

      // this.parseCourse()
    },
    calcPercent: function calcPercent(type) {
      var percent = 0;
      var credit = 0;
      var needCredit = 0;

      if (type === 'tot') {
        _.each(this.thresholdInfo, function (val) {
          credit += val.credit;
        });
        _.each(this.thresholdInfo, function (val) {
          needCredit += val.needCredit;
        });
      } else {
        credit = this.thresholdInfo[type].credit;
        needCredit = this.thresholdInfo[type].needCredit;
      }

      var calcSol = credit / needCredit * 100;
      if (_.isNaN(calcSol) || calcSol === 0) {
        percent = 1;
      } else {
        percent = calcSol;
      }
      return parseInt(percent);
    },
    progressInit: function progressInit() {
      var _this4 = this;

      setTimeout(function () {
        _this4.progressSetting('tot');
        $.each(_this4.thresholdInfo, function (key, val) {
          _this4.progressSetting(key);
        });
      }, 50);
    },
    progressSetting: function progressSetting(type) {
      var _$$circliful;

      var icon = '';
      if (type === 'tot') icon = 'f19d';else if (type === 'major') icon = 'f024';else if (type === 'elective') icon = 'f11d';else if (type === 'general') icon = 'f02d';else if (type === 'sport') icon = 'f1e3';

      $('#' + type + ' .circle-progress').circliful((_$$circliful = {
        animation: 1,
        animationStep: 5,
        foregroundBorderWidth: 5,
        backgroundBorderWidth: 1,
        percent: 50,
        iconColor: '#3498DB',
        iconSize: '40',
        iconPosition: 'middle'
      }, _defineProperty(_$$circliful, 'percent', this.calcPercent(type)), _defineProperty(_$$circliful, 'icon', icon), _$$circliful));
    },
    switchPage: function switchPage(num) {
      if (this.activePage !== num) {
        this.activePage = num;
        window.scrollTo(0, 0);
        if (num === 1) {
          this.progressInit();
        }
      }
    },
    editNeedCrredit: function editNeedCrredit(type, event) {
      var _this5 = this;

      event.stopPropagation();
      swal({
        title: '修改畢業' + type + '學分',
        input: 'text',
        showCancelButton: true,
        closeOnConfirm: false,
        animation: true,
        inputPlaceholder: '畢業' + type + '學分'
      }).then(function (inputVal) {
        var caredit = _.parseInt(inputVal);
        if (!_.isNaN(caredit)) {
          if (inputVal === false) return false;

          if (!_.isNaN(caredit) && caredit > 0) {
            if (type === '必修') {
              _this5.thresholdInfo.major.needCredit = caredit;
            } else if (type === '選修') {
              _this5.thresholdInfo.elective.needCredit = caredit;
            }
          } else {
            swal.showInputError('請填寫正確數值!');
            return false;
          }

          swal('修改成功', '已經將畢業' + type + '學分修改為' + caredit + '學分', 'success');
        } else {
          swal('錯誤', '請填入正確數字', 'error');
        }
      });
    },
    getCourseInfo: function getCourseInfo(info) {
      var html = '<ul class="courseInfo"><li>學年：' + info['學年'] + '</li><li>學期：' + info['學期'] + '</li><li>選課號碼：' + info['選課號碼'] + '</li><li>課程名稱：' + info['課程名稱'] + '</li><li>開課系所：' + info['開課系所'] + '</li><li>學分：' + info['畢業學分'] + '</li><li>成績：' + info['成績'] + '</li><li>所屬項目：' + info['所屬項目'] + '</li></ul>';

      swal({
        title: '詳細資料',
        html: html
      });
    },
    showCourseList: function showCourseList() {
      $('#totCourseList').modal();
    },
    showCourseType: function showCourseType(type) {
      this.switchSubject(type);
      $('#courseList').modal();
    },
    showLogoutMsg: function showLogoutMsg() {
      var _this6 = this;

      swal({
        title: 'Are you sure?',
        text: '你確定要登出系統嗎',
        type: 'question',
        showCancelButton: true
      }).then(function () {
        _this6.logout();
      });
    },
    showCourseSetting: function showCourseSetting(title, code) {
      var _this7 = this;

      var subjectType = {
        '必修': 'major',
        '選修': 'elective',
        '通識': 'general',
        '體育': 'sport',
        '其他': 'other'
      };
      var subjectKey = {
        'major': '必修',
        'elective': '選修',
        'general': '通識',
        'sport': '體育',
        'other': '其他'
      };
      var subject = subjectType[this.subjectTitle];
      delete subjectKey[subject];

      // inputOptions can be an object or Promise
      var inputOptions = new Promise(function (resolve) {
        resolve(subjectKey);
      });
      swal({
        title: '將 ' + title + ' 移動至',
        input: 'radio',
        inputOptions: inputOptions,
        inputValidator: function inputValidator(result) {
          return new Promise(function (resolve, reject) {
            if (result) {
              resolve();
            } else {
              reject('You need to select something!');
            }
          });
        }
      }).then(function (result) {
        var findKey = _.findKey(_this7.thresholdInfo[subject]['course'], { '選課號碼': _.toString(code) });

        _this7.thresholdInfo[result]['course'].push(_this7.thresholdInfo[subject]['course'][findKey]);
        var score = _this7.thresholdInfo[subject]['course'][findKey]['成績'];

        if (score >= 60) {
          _this7.thresholdInfo[subject]['credit'] -= _this7.thresholdInfo[subject]['course'][findKey]['畢業學分'];
          _this7.thresholdInfo[result]['credit'] += _this7.thresholdInfo[subject]['course'][findKey]['畢業學分'];
        }
        _this7.thresholdInfo[subject]['course'].splice(findKey, 1);
        swal({
          type: 'success',
          html: '你已經將 ' + title + ' 移動至 ' + subjectKey[result] + ' 課程'
        });
      });
    },
    showList: function showList(type) {
      this.activePage = 5;
      this.switchSubject(type);
    },
    switchSubject: function switchSubject(type) {
      this.subjectList = this.thresholdInfo[type];

      if (type === 'major') this.subjectTitle = '必修';else if (type === 'elective') this.subjectTitle = '選修';else if (type === 'general') this.subjectTitle = '通識';else if (type === 'sport') this.subjectTitle = '體育';else if (type === 'other') this.subjectTitle = '其他';
    },
    saveMoveSol: function saveMoveSol() {
      var _this8 = this;

      swal({
        title: 'Are you sure?',
        text: '你確定要儲存搬移後的內容嗎',
        type: 'question',
        showCancelButton: true
      }).then(function () {
        _this8.saveToStorage();
      });
    },
    parseCourse: function parseCourse() {
      var _this9 = this;

      var schedule = _.map(Array(13), function () {
        return _.map(Array(5), function () {
          return [{}, 0];
        });
      });
      var years = _.max(_.keys(this.creditSummary));

      $.each(this.creditSummary[years]['total'], function (key, val) {
        var code = val['選課號碼'];
        var course = _this9.courseCode[code];
        $.each(course['time_parsed'], function (ik, iv) {
          $.each(iv.time, function (jk, jv) {
            var day = iv.day;
            var time = jv;
            schedule[time - 1][day - 1] = course['title_parsed']['zh_TW'];
          });
        });
      });
      this.timeTable = schedule;
    },
    login: function login(e) {
      var _this10 = this;

      e.preventDefault();
      var url = 'https://login.hsingpicking.com.tw/';
      // let url = 'http://127.0.0.1:3001/'
      var loginData = {
        'id': this.studentId,
        'pw': this.studentPw
      };

      $('#login button').fadeOut();
      $('.loading').css('opacity', 1);

      $.post(url, loginData, function (inputData) {
        var input = JSON.parse(inputData);
        if (inputData !== 'error' && input['studentName'] !== '') {
          _this10.activePage = 1;

          _this10.studentName = input['studentName'];
          _this10.studentDept = input['studentDept'];
          _this10.getData(input['courseList']);
        } else {
          _this10.studentId = '';
          _this10.studentPw = '';
          sweetAlert('Oops...', '請確認學號及密碼是否正確', 'error');
        }
        $('#login button').show();
        $('.loading').css('opacity', 0);
      });
    },
    showAbout: function showAbout() {
      $('#about').modal();
    },
    showDownload: function showDownload() {
      $('#download').modal();
    },
    logout: function logout() {
      this.activePage = 0;

      this.thresholdInfo = { major: { credit: 0, needCredit: 68, course: [] }, elective: { credit: 0, needCredit: 32, course: [] }, general: { credit: 0, needCredit: 30, course: [] }, sport: { credit: 0, needCredit: 4, course: [] }, other: { credit: 0, needCredit: 0, course: [] } };
      this.otherThreshold = { service: true, english: false };
      this.creditSummary = {};

      this.studentId = '';
      this.studentPw = '';

      this.clearStorage();
    },
    saveToStorage: function saveToStorage() {
      window.localStorage['studentId'] = JSON.stringify(this.studentId);
      window.localStorage['studentName'] = JSON.stringify(this.studentName);
      window.localStorage['studentDept'] = JSON.stringify(this.studentDept);
      window.localStorage['creditSummary'] = JSON.stringify(this.creditSummary);
      window.localStorage['thresholdInfo'] = JSON.stringify(this.thresholdInfo);
    },
    loadStorage: function loadStorage() {
      this.studentId = JSON.parse(window.localStorage['studentId']);
      this.studentName = JSON.parse(window.localStorage['studentName']);
      this.studentDept = JSON.parse(window.localStorage['studentDept']);
      this.creditSummary = JSON.parse(window.localStorage['creditSummary']);
      this.thresholdInfo = JSON.parse(window.localStorage['thresholdInfo']);
    },
    clearStorage: function clearStorage() {
      localStorage.removeItem('studentId');
      localStorage.removeItem('studentName');
      localStorage.removeItem('studentDept');
      localStorage.removeItem('creditSummary');
      localStorage.removeItem('thresholdInfo');
    }
  }
});