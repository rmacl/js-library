
//to load data
var optionTagListData = function (sUrl) {
    this.sUrl = sUrl;
    this.aTagListData = null;
};

optionTagListData.prototype.load = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        WMS.ajax({
            url: self.sUrl,
            data: {mode: 'list'},
            success: function (response) {
                self.aTagListData = response;
                response != null ? resolve(response) : reject();
            }
        });
    });
};

//create selectbox object
var searchSelect = function (oOption, aData, aParams) {
    this.oOption = oOption;
    this.aData = aData;
    this.aParams = aParams || {};
};

//setting event
searchSelect.prototype.setEvent = function () {
    var sWrapperClassSelector = '.' + this.oOption.divWrapperClass;
    var self = this;

    $('body').delegate(sWrapperClassSelector, 'click', function (e) {
        e.stopPropagation();
        if ($(sWrapperClassSelector).hasClass('selected') == false) {
            $(sWrapperClassSelector).addClass('selected');
        }
    });

    $('body').click(function () {
        if ($(sWrapperClassSelector).hasClass('selected') == true) {
            $(sWrapperClassSelector).removeClass('selected');
        }
    });

    //even handle for checkbox
    $('body').delegate(sWrapperClassSelector + ' .fChk', 'click', function (e) {
        self.handleCheckBox(sWrapperClassSelector, e);
    });

    $('body').delegate(sWrapperClassSelector + ' .' + this.oOption.inputBoxClass, 'keydown',
        _debounce(function (e) {
            self.bindKeyDownEvent(e);
        }, 100));

    if (this.oOption.checkAllClass != null) {
        $('body').delegate(sWrapperClassSelector + ' .' + this.oOption.checkAllClass, 'change', function (e) {
            self.handleCheckAll(sWrapperClassSelector, e);
        });
    }
};

//key event
searchSelect.prototype.bindKeyDownEvent = function (e) {
    var oKeyboardInput = {38: 'up', 40: 'down', 13: 'enter'};
    var iUp = (-1);
    var iDown = 1;
    switch (oKeyboardInput[e.keyCode]) {
        case 'up':
            this.moveHighlight(iUp, e);
            break;
        case 'down':
            this.moveHighlight(iDown, e);
            break;
        case 'enter':
            this.checkByEnterKey(e);
            break;
        default :
            this.autoSearch(e);
    }
};

searchSelect.prototype.moveHighlight = function (iDirection, e) {
    var oWrapperClass = $('.' + this.oOption.divWrapperClass);
    var oTargetLi = oWrapperClass.find('li');
    var iFocusedIndex = oWrapperClass.find('li.focus').index();
    var iNextIndex = iFocusedIndex + iDirection;
    //when you key up with focuse on top list
    if (iDirection == -1 && iFocusedIndex == 0) {
        return false;
    }

    //when there is no focused list 
    if (iDirection == -1 && iFocusedIndex == -1) {
        oWrapperClass.find('li:eq(0)').addClass('focus');
        return false;
    }
    oTargetLi.eq(iFocusedIndex).removeClass('focus');
    oTargetLi.eq(iNextIndex).addClass('focus');
};

//when press enter when focus is on <li> 
searchSelect.prototype.checkByEnterKey = function (e) {

    var oList = $('.' + this.oOption.divWrapperClass).find('li.focus .fChk');
    var sWrapperClassSelector = '.' + this.oOption.divWrapperClass;
    var sCheckAllClass = this.oOption.checkAllClass || '';
    if (oList.hasClass(sCheckAllClass) == true) {
        return this.setAllSearch(sCheckAllClass);
    }
    if (this.oOption.iCheckedLimit !== null && this.limitCheckedNo(sWrapperClassSelector) == false) {
        return false;
    }
    var isChecked = !oList.attr('checked');
    oList.attr('checked', isChecked);
    this.setCheckedValue(sWrapperClassSelector);
};

searchSelect.prototype.setAllSearch = function (sCheckAllClass) {
    var sWrapperClassSelector = '.' + this.oOption.divWrapperClass;
    var oList = $(sWrapperClassSelector+ ' .fChk');
    var oTarget = $(sWrapperClassSelector + ' .' + sCheckAllClass);
    var isCheckedAll = !oTarget.attr('checked');
    oList.attr('checked', isCheckedAll);

    var sText = isCheckedAll ? '전체' : '';
    $(sWrapperClassSelector + ' input[name=\"' + this.oOption.selectInputName + '\"]').val('');
    $(sWrapperClassSelector + ' .' + this.oOption.inputBoxClass).attr('placeholder', sText);

};

searchSelect.prototype.handleCheckBox = function (sWrapperClassSelector, e) {
    var oTarget = $(e.currentTarget);
    //when there is limit of number to check
    if (this.oOption.iCheckedLimit !== null && this.limitCheckedNo(sWrapperClassSelector) == false) {
        oTarget.parent().removeAttr('selected');
        oTarget.attr('checked', false);
        return false;
    }
    this.setCheckedValue(sWrapperClassSelector);
};

//when you check 'check all'
searchSelect.prototype.handleCheckAll = function (sWrapperClassSelector, e) {
    var isChecked = !!$(e.currentTarget).attr('checked');
    $(sWrapperClassSelector + ' .fChk').attr('checked', isChecked);
};

searchSelect.prototype.setCheckedValue = function (sWrapperClassSelector) {
    var sCheckedValue = '';
    var sValue = '';
    var oInput = $(sWrapperClassSelector + ' .' + this.oOption.inputBoxClass);
    var oSelectNameInput = $(sWrapperClassSelector + ' input[name=\"' + this.oOption.selectInputName + '\"]');
    var oChecked = this.oOption.checkAllClass ? $(sWrapperClassSelector + ' .fChk:checked') : $(sWrapperClassSelector + ' .fChk:checked').not('.' + this.oOption.checkAllClass);

    oChecked.each(function () {
        var sVal = $(this).val();
        sCheckedValue += ',' + sVal;
        sValue = sCheckedValue.substr(1);
        oSelectNameInput.val(sValue);

        if(sVal == 'all'){
            sValue = 'all';
        }
        oInput.attr('placeholder', sValue);
    });
};

searchSelect.prototype.limitCheckedNo = function (sWrapperClassSelector) {
    var oChecked = $(sWrapperClassSelector + ' .fChk:checked');
    var iCheckedLimit = this.oOption.iCheckedLimit || null;
    if (iCheckedLimit !== null && oChecked.length > iCheckedLimit) {
        var sAlertMessage = 'less than' oChecked.length + 'can be selected';
        alert(__(sAlertMessage));
        return false;
    }
    return true;
};
searchSelect.prototype.autoSearch = function (e) {
    var oList = $('.' + this.oOption.divWrapperClass + ' li:not(.noData)');

    var oNoneSearchResult = $('.' + this.oOption.divWrapperClass + ' li.noData');
    var sInputText = $(e.currentTarget).val();
    var bSearchResult = false;
    oNoneSearchResult.hide();
    oList.each(function () {
        if ($(this).text().indexOf(sInputText) < 0) {
            $(this).hide();
        } else {
            bSearchResult = true;
            $(this).show();
        }
    });
    //검색결과 없을때
    if (bSearchResult == false && sInputText.length !== 0) {
        oNoneSearchResult.show();
    }
};

//key event debounce
var _debounce = function (func, delay) {
    var inDebounce = undefined;
    return function () {
        var context = this;
        var args = arguments;
        clearTimeout(inDebounce);
        return inDebounce = setTimeout(function () {
            return func.apply(context, args);
        }, delay);
    }
};


searchSelect.prototype.makeSelectBoxHtml = function () {
    var sHtml = '';
    var sSelected = '';
    sHtml += '<div class="mInputForm eToggle ' + this.oOption.divWrapperClass + '">';
    sHtml += '<input type="hidden" value="" name="' + this.oOption.selectInputName + '"/>';
    sHtml += '<input type="text" class="fText ' + this.oOption.inputBoxClass + '" autocomplete="off" style="width:' + (this.oOption.width || '200px') + ';" placeholder="' + (this.oOption.placeholder || '선택해주세요') + '"/>';

    sHtml += '<ul class="' + (this.oOption.ulClass || 'result') + '">';
    if (!!this.oOption.checkAllClass == true) {
        sHtml += '<li><label><input type="checkbox" class="fChk ' + this.oOption.checkAllClass + '"> all </label></li>';
    }
    this.aData.forEach(function (sOptionTag, iIndex) {
        sHtml += '<li><label><input type="checkbox" class="fChk" value ="' + sOptionTag + '"/>' + sOptionTag + '</label></li>';
    });
    sHtml += (this.oOption.noSearchArea) || '<li class="noData center" style="text-align: center; display : none;"><label><span>There is no search result.</span></label></li>';

    sHtml += '</ul>';
    sHtml += '</div>';
    return sHtml;
};
