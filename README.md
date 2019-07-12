

Use response data which is value of resolved promise as parameter when you create selectbox.
#Two fields divWrapperClass, selectInputName are required.



| field | Description |
| --- | --- |
| `divWrapperClass` | selex box wrapper class name |
| `selectInputName`  | |
| placeholder |placeholder text for input box |
| iCheckedLimit | when you want to limit the possible number of checked |
| inputWith | width of input box |
| noSearchArea | html tag you want to displa for no search result area |



```javascript
//sample code
$(function () {
    var sUrl = '/makgoli/list';
    var oOption = {
        'divWrapperClass': '',
        'selectInputName': '',
        'placeholder': 'placeholder',
        'iCheckedLimit': 5 , when you wan
        'inputWith': '150px',
        'noSearchArea' : '<li>no search result..</li>'
    };
    var oData = new optionTagListData(sUrl);
    var oPromise = oData.load().then(function (response) {
    var sHtml = makeSelectBoxHtml(oOption, response['aOptionTagList'], response['aParams']);
    var oSelectBox = new searchSelect(sHtml);
    });
    oSelectBox.setEvent();
});
```
