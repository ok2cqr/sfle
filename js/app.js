var Bands = {
  b160M: {
    cw: "1.825",
    ssb: "1.890",
    digi: "1.840",
  },
  b80M: {
    cw: "3.532",
    ssb: "3.770",
    digi: "3.573",
  },
  b60M: {
    cw: "5.353",
    ssb: "5.450",
    digi: "5.357",
  },
  b40M: {
    cw: "7.032",
    ssb: "7.100",
    digi: "7.074",
  },
  b30M: {
    cw: "10.110",
    ssb: "10.120",
    digi: "10.136",
  },
  b20M: {
    cw: "14.032",
    ssb: "14.200",
    digi: "14.074",
  },
  b17M: {
    cw: "18.070",
    ssb: "18.120",
    digi: "18.104",
  },
  b15M: {
    cw: "21.032",
    ssb: "21.200",
    digi: "21.074",
  },
  b12M: {
    cw: "24.895",
    ssb: "24.910",
    digi: "24.915",
  },
  b10M: {
    cw: "20.032",
    ssb: "28.200",
    digi: "28.074",
  },
  b6M: {
    cw: "50.090",
    ssb: "50.350",
    digi: "50.313",
  },
  b2M: {
    cw: "144.090",
    ssb: "144.250",
    digi: "144.174",
  },
  b70CM: {
    cw: "432.050",
    ssb: "432.300",
    digi: "432.065",
  },
};

var $textarea = $("textarea");
var qsodate = "";
var qsotime = "";
var band = "";
var mode = "";
var freq = "";
var callsign = "";
var errors = [];
var qsoList = [];

function handleInput() {
  var qsodate = "";
  if ($("#qsodate").val()) {
    qsodate = new Date($("#qsodate").val()).toISOString().split("T")[0];
  } else {
    qsodate = new Date().toISOString().split("T")[0];
  }

  var operator = $("#operator").val();
  operator = operator.toUpperCase();
  var ownCallsign = $("#my-call").val().toUpperCase();
  ownCallsign = ownCallsign.toUpperCase();

  var extraQsoDate = qsodate;
  var band = "";
  var mode = "";
  var freq = "";
  var callsign = "";
  var sotaWff = "";
  qsoList = [];
  $("#qsoTable tbody").empty();

  var text = $textarea.val().trim();
  lines = text.split("\n");
  lines.forEach((row) => {
    var rst_s = null;
    var rst_r = null;
    items = row.split(" ");
    var itemNumber = 0;
    items.forEach((item) => {
      if (item === '') {
        return;
      }
      if (item.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)) {
        extraQsoDate = item;
      } else if ((item.match(/^[0-2][0-9][0-5][0-9]$/) && itemNumber === 0)) {
        qsotime = item;
      } else if (item.match(/^CW$|^SSB$|^FM$|^AM$|^PSK$|^FT8$/i)) {
        mode = item.toUpperCase();
      } else if (item.match(/^[1-9]?\d\d[Mm]$/) || item.toUpperCase() === '70CM') {
        band = item.toUpperCase();
        freq = 0;
      } else if (item.match(/^\d+\.\d+$/)) {
        freq = item;
        band = '';
      } else if (item.match(/^[1-9]{1}$/) && qsotime && itemNumber === 0) {
        qsotime = qsotime.replace(/.$/, item);
      } else if (item.match(/^[0-5][0-9]{1}$/) && qsotime && itemNumber === 0) {
        qsotime = qsotime.slice(0, -2) + item;
      } else if (
        item.match(/^([A-Z]*[F]{2}-\d{4})|([A-Z]*[A-Z]\/[A-Z]{2}-\d{3})$/i)
      ) {
        sotaWff = item.toUpperCase();
      } else if (
        item.match(
          /([a-zA-Z0-9]{1,3}[0123456789][a-zA-Z0-9]{0,3}[a-zA-Z])|.*\/([a-zA-Z0-9]{1,3}[0123456789][a-zA-Z0-9]{0,3}[a-zA-Z])|([a-zA-Z0-9]{1,3}[0123456789][a-zA-Z0-9]{0,3}[a-zA-Z])\/.*/
        )
      ) {
        callsign = item.toUpperCase();
      } else if ((itemNumber > 0) && (item.match(/(^[1-9][1-9]?[1-9]?$)/i))) {
        if (rst_s === null) {
          rst_s = item;
        } else {
          rst_r = item;
        }  
      }

      itemNumber = itemNumber + 1;
    });

    errors = [];
    checkMainFieldsErrors();

    if (callsign) {
      if (freq === 0) {
        freq = getFreqFromBand(band, mode);
      } else if (band === '') {
        band = getBandFromFreq(freq);
      }

      if (band === "") {
        addErrorMessage("Band is missing!");
      }
      if (mode === "") {
        addErrorMessage("Mode is missing");
      }
      if (qsotime === "") {
        addErrorMessage("Time is not set!");
      }

      if (isValidDate(extraQsoDate) === false) {
        addErrorMessage("Invalid date " + extraQsoDate);
        extraQsoDate = qsodate;
      }

      console.log(rst_s);
      console.log(rst_r);
      rst_s = getReportByMode(rst_s, mode);
      rst_r = getReportByMode(rst_r, mode);
      console.log(rst_s);
      console.log(rst_r);


      qsoList.push([
        extraQsoDate,
        qsotime,
        callsign,
        freq,
        band,
        mode,
        rst_s,
        rst_r,
        sotaWff,
      ]);
      // console.log(row);
      const tableRow = $(`<tr>
        <td>${extraQsoDate}</td>
        <td>${qsotime}</td>
        <td>${callsign}</td>
        <td><span data-toggle="tooltip" data-placement="left" title="${freq}">${band}</span></td>
        <td>${mode}</td>
        <td>${rst_s}</td>
        <td>${rst_r}</td>
        <td>${operator}</td>
        <td>${sotaWff}</td>
      </tr>`);

      $("#qsoTable > tbody:last-child").append(tableRow);

      localStorage.setItem("tabledata", $("#qsoTable").html());
      localStorage.setItem("my-call", $("#my-call").val());
      localStorage.setItem("operator", $("#operator").val());
      localStorage.setItem("my-sota-wwff", $("#my-sota-wwff").val());
      localStorage.setItem("qso-area", $(".qso-area").val());
      localStorage.setItem("qsodate", $("#qsodate").val());
      localStorage.setItem("my-power", $("#my-power").val());
      localStorage.setItem("my-grid", $("#my-grid").val());

      callsign = "";
      sotaWff = "";
    }

    showErrors();
  }); //lines.forEach((row)   

  // Scroll to the bototm of #qsoTableBody (scroll by the value of its scrollheight property)
  $("#qsoTableBody").scrollTop($('#qsoTableBody').get(0).scrollHeight);

  var qsoCount = qsoList.length;
  if (qsoCount) {
    $(".js-qso-count").html("<strong>Total:</strong> " + qsoCount + " QSO");
  } else {
    $(".js-qso-count").html("");
  }

  if (errors) {
    $(".js-status").html(errors.join("<br>"));
  }
}

function checkMainFieldsErrors() {
  if ($("#my-call").val() === "") {
    addErrorMessage("'My call' field is empty!");
  }

  if ($("#operator").val() === "") {
    addErrorMessage("'Operator' field is empty!");
  }
}

$textarea.keydown(function (event) {
  if (event.which == 13) {
    handleInput();
  }
});

$textarea.focus(function () {
  errors = [];
  checkMainFieldsErrors();
  showErrors();
});

function addErrorMessage(errorMessage) {
  errorMessage = '<span class="text-danger">' + errorMessage + "</span>";
  if (errors.includes(errorMessage) == false) {
    errors.push(errorMessage);
  }
}

function isValidDate(d) {
  return new Date(d) !== "Invalid Date" && !isNaN(new Date(d));
}

$(".js-reload-qso").click(function () {
  handleInput();
});

$(".js-empty-qso").click(function () {
  var result = confirm("Do you really want to reset everything?");
  if (result == true) {
    localStorage.removeItem("tabledata");
    localStorage.removeItem("my-call");
    localStorage.removeItem("operator");
    localStorage.removeItem("my-sota-wwff");
    localStorage.removeItem("qso-area");
    localStorage.removeItem("qsodate");
    localStorage.removeItem("my-grid");
    $("#qsodate").val("");
    $("#qsoTable tbody").empty();
    $("#my-sota-wwff").val("");
    $("#my-call").val("");
    $("#operator").val("");
    $(".qso-area").val("");
    $("#my-grid").val("");
    qsoList = [];
    $(".js-qso-count").html("");
  }
});

function showErrors() {
  if (errors) {
    $(".js-status").html(errors.join("<br>"));
  }
}

$(".js-download-qso").click(function () {
  handleInput();
});

$(".js-load-sample-log").click(function () {
  if ($textarea.val()) {
    if (false ===confirm("Do you really want to replace the entered data with the sample log?")) {
      return false;
    }
  }
  const logData = `
80m cw
1212 ok1uu okff-1234
3 ok1rr
4 ok1tn
20 dl6kva 7 8
5 dl5cw 
ssb
32 ok7wa ol/zl-071 5 8
33 ok1xxx  4 3
CW
35 W8FJ 3 4
38 N2KW 449 579
  `;

  $textarea.val(logData.trim());
  if ($("#my-call").val() === "") {
    $("#my-call").val("OK2CQR/P");
  }
  if ($("#operator").val() === "") {
    $("#operator").val("OK2CQR");
  }
  if ($("#my-sota-wwff").val() === "") {
    $("#my-sota-wwff").val("OKFF-2068");
  }

  handleInput();
});

function getBandFromFreq(freq) {
  if (freq > 1.7 && freq < 2) {
    return "160M";
  } else if (freq > 3.4 && freq < 4) {
    return "80M";
  } else if (freq > 6.9 && freq < 7.3) {
    return "40M";
  } else if (freq > 5 && freq < 6) {
    return "60M";
  } else if (freq > 10 && freq < 11) {
    return "30M";
  } else if (freq > 13 && freq < 15) {
    return "20M";
  } else if (freq > 18 && freq < 19) {
    return "17M";
  } else if (freq > 20 && freq < 22) {
    return "15M";
  } else if (freq > 24 && freq < 25) {
    return "12M";
  } else if (freq > 27 && freq < 30) {
    return "10M";
  } else if (freq > 50 && freq < 55) {
    return "6M";
  } else if (freq > 144 && freq < 149) {
    return "2M";
  } else if (freq > 430 && freq < 460) {
    return "70CM";
  }

  return '';
}

function getFreqFromBand(band, mode) {
  const settingsMode = getSettingsMode(mode.toUpperCase());
  const id = "#" + band.toUpperCase() + settingsMode;
  if ($(id).length) {
    return $(id).val();
  }
}

function getSettingsMode(mode) {
  if (mode === "AM" || mode === "FM" || mode === "SSB") {
    return "SSB";
  }

  if (mode === "CW") {
    return "CW"
  }

  return "DIGI";
}

var htmlSettings = "";
for (const [key, value] of Object.entries(Bands)) {
  htmlSettings = `
    ${htmlSettings}
    <div class="row">
      <div class="col-3 mt-4">
        <strong>${key.slice(1)}</strong>
      </div>
      <div class="col-3">
        <div class="form-group">
          <label for="${key.slice(1)}CW">CW</label>
          <input type="text" class="form-control text-uppercase" id="${key.slice(
            1
          )}CW" value="${value.cw}">
        </div>							
      </div>
      <div class="col-3">
        <div class="form-group">
          <label for="${key.slice(1)}SSB">SSB</label>
          <input type="text" class="form-control text-uppercase" id="${key.slice(
            1
          )}SSB" value="${value.ssb}">
        </div>							
      </div>
      <div class="col-3">
        <div class="form-group">
          <label for="${key.slice(1)}DIGI">DIGI</label>
          <input type="text" class="form-control text-uppercase" id="${key.slice(
            1
          )}DIGI" value="${value.digi}">
        </div>							
      </div>

    </div>
  `;
}
$(".js-band-settings").html(htmlSettings);

$(".js-download-adif").click(function () {
  var operator = $("#operator").val();
  operator = operator.toUpperCase();
  var ownCallsign = $("#my-call").val().toUpperCase();
  ownCallsign = ownCallsign.toUpperCase();
  var mySotaWwff = $("#my-sota-wwff").val().toUpperCase();

  var myPower =  $("#my-power").val();
  var myGrid = $("#my-grid").val().toUpperCase();

  const adifHeader = `
ADIF export from Simple fast log entry by Petr, OK2CQR

Internet: https://sfle.ok2cqr.com

<ADIF_VER:5>2.2.1
<PROGRAMID:4>SFLE
<PROGRAMVERSION:5>0.0.1
<EOH>

`;

  if (false === isBandModeEntered()) {
    alert("Some QSO do not have band and/or mode defined!");

    return false;
  }

  var adif = adifHeader;
  qsoList.forEach((item) => {
    const qsodate = item[0].replace("-", "").replace("-", "");
    qso = getAdifTag("QSO_DATE", qsodate);
    qso = qso + getAdifTag("TIME_ON", item[1].replace(":", ""));
    qso = qso + getAdifTag("CALL", item[2]);
    qso = qso + getAdifTag("FREQ", item[3]);
    qso = qso + getAdifTag("BAND", item[4]);
    qso = qso + getAdifTag("MODE", item[5]);

    var rst = item[6];
    settingsMode = getSettingsMode(rst);
    if (settingsMode === "SSB") {
      rst = "59";
    }
    qso = qso + getAdifTag("RST_SENT", rst);

    var rst = item[7];
    settingsMode = getSettingsMode(rst);
    if (settingsMode === "SSB") {
      rst = "59";
    }
    qso = qso + getAdifTag("RST_RCVD", rst);

    qso = qso + getAdifTag("OPERATOR", operator);
    qso = qso + getAdifTag("STATION_CALLSIGN", ownCallsign);

    if (isSOTA(mySotaWwff)) {
      qso = qso + getAdifTag("MY_SOTA_REF", mySotaWwff);
    } else if (isWWFF(mySotaWwff)) {
      qso = qso + getAdifTag("MY_SIG", "WWFF");
      qso = qso + getAdifTag("MY_SIG_INFO", mySotaWwff);
    }

    if (isSOTA(item[8])) {
      qso = qso + getAdifTag("SOTA_REF", item[8]);
    } else if (isWWFF(item[8])) {
      qso = qso + getAdifTag("SIG", "WWFF");
      qso = qso + getAdifTag("SIG_INFO", item[8]);
    }
    
    if (myPower) {
      qso = qso + getAdifTag("TX_PWR", myPower);
    }

    if (myGrid) {
      qso = qso + getAdifTag("MY_GRIDSQUARE", myGrid);
    }

    qso = qso + "<EOR>";

    adif = adif + qso + "\n";
  });

  qsodate = qsoList[0][0].replace("-", "").replace("-", "");
  const filename =
    operator.replace("/", "-") +
    "_" +
    mySotaWwff.replace("/", "-") +
    "_" +
    qsodate +
    ".adi";
  download(filename, adif);
});

function isBandModeEntered()
{
  let isBandModeOK = true;
  qsoList.forEach((item) => {
    if ((item[4] === '') || (item[5] === '')) {
      isBandModeOK = false;
    }
  });

  return isBandModeOK;
}

function getAdifTag(tagName, value) {
  return "<" + tagName + ":" + value.length + ">" + value + " ";
}

function getReportByMode(rst, mode) {
  settingsMode = getSettingsMode(mode);

  if (rst === null) {
    if (settingsMode === "SSB") {
      return "59";
    }

    return "599";
  } 

  if (settingsMode === "SSB") {
    if (rst.length === 1) {
      return '5' + rst;
    } 
    
    return rst;
  }
  
  if (rst.length === 1) {
    return '5' + rst + '9';
  } else if (rst.length === 2) {
    return rst + '9';
  }

  return rst;
}

function isSOTA(value) {
  if (value.match(/^[A-Z]*[A-Z]\/[A-Z]{2}-\d{3}$/)) {
    return true;
  }

  return false;
}

function isWWFF(value) {
  if (value.match(/^[A-Z]*[F]{2}-\d{4}$/)) {
    return true;
  }

  return false;
}

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function loadPowerSettings() {
  myPower = localStorage.getItem('my-power');

  let element = document.getElementsByClassName('js-power');
  if (myPower) {
    element[0].innerHTML = 'Power: ' + myPower + 'W &nbsp;&nbsp;&nbsp;&nbsp;';  
  } else {
    element[0].innerHTML = '';
  }

  document.getElementById('my-power').value = myPower;
}

function loadMyGridSettings () {
  myGrid = localStorage.getItem('my-grid');

  let element = document.getElementsByClassName('js-my-grid');
  if (myGrid) {
    element[0].innerHTML = 'My grid: ' + myGrid.toUpperCase();  
  } else {
    element[0].innerHTML = '';
  }

  document.getElementById('my-grid').value = myGrid;
}

document.getElementById('my-power').onchange = function() {
  localStorage.setItem('my-power', this.value);
  loadPowerSettings();
};

document.getElementById('my-grid').onchange = function() {
  localStorage.setItem('my-grid', this.value);
  loadMyGridSettings();
};


$(document).ready(function () {
  var tabledata = localStorage.getItem("tabledata");
  var mycall = localStorage.getItem("my-call");
  var operator = localStorage.getItem("operator");
  var mysotawwff = localStorage.getItem("my-sota-wwff");
  var qsoarea = localStorage.getItem("qso-area");
  var qsodate = localStorage.getItem("qsodate");
  var myPower = localStorage.getItem("my-power");
  var myGrid = localStorage.getItem("my-grid");

  if (mycall != null) {
    $("#my-call").val(mycall);
  }

  if (operator != null) {
    $("#operator").val(operator);
  }

  if (mysotawwff != null) {
    $("#my-sota-wwff").val(mysotawwff);
  }

  if (qsoarea != null) {
    $(".qso-area").val(qsoarea);
  }

  if (qsodate != null) {
    $("#qsodate").val(qsodate);
  }

  if (myPower != null) {
    $("#my-power").val(myPower);
  }

  if (myGrid != null) {
    $("#my-grid").val(myGrid);
  }

  if (tabledata != null) {
    $("#qsoTable").html(tabledata);
    handleInput();
  }

  loadPowerSettings();
  loadMyGridSettings();
});
