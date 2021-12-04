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
if ($("#qsodate").val()) {
  qsodate = new Date($("#qsodate").val()).toISOString().split("T")[0];
} else {
  qsodate = new Date().toISOString().split("T")[0];
}

var qsotime = "";
var band = "";
var mode = "";
var freq = "";
var callsign = "";
var errors = [];
var qsoList = [];

function handleInput() {
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
    items = row.split(" ");
    items.forEach((item) => {
      if (item.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)) {
        extraQsoDate = item;
      } else if (item.match(/^[0-2][0-5][0-5][0-9]$/)) {
        qsotime = item;
      } else if (item.match(/^[1-9]?\d\d[Mm]$/)) {
        band = item.toUpperCase();
        freq = getFreqFromBand(band, mode);
      } else if (item.match(/^CW$|^SSB$|^FM$|^AM$|^PSK$|^FT8$/i)) {
        mode = item.toUpperCase();
      } else if (item.match(/^\d+\.\d+$/)) {
        freq = item;
        band = getBandFromFreq(freq);
      } else if (item.match(/^[1-9]{1}$/) && qsotime) {
        qsotime = qsotime.replace(/.$/, item);
      } else if (item.match(/^[0-5][0-9]{1}$/) && qsotime) {
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
      }
    });

    errors = [];
    checkMainFieldsErrors();

    if (callsign) {
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

      qsoList.push([
        extraQsoDate,
        qsotime,
        callsign,
        freq,
        band,
        mode,
        "599",
        "599",
        sotaWff,
      ]);

      $("#qsoTable > tbody:last-child").append(
        "<tr>" +
          "<td>" +
          extraQsoDate +
          "</td>" +
          "<td>" +
          qsotime +
          "</td>" +
          "<td>" +
          callsign +
          "</td>" +
          "<td>" +
          band +
          "</td>" +
          "<td>" +
          mode +
          "</td>" +
          "<td>" +
          getReportByMode(mode) +
          "</td>" +
          "<td>" +
          getReportByMode(mode) +
          "</td>" +
          "<td>" +
          operator +
          "</td>" +
          "<td>" +
          sotaWff +
          "</td>" +
          "</tr>"
      );

      callsign = "";
      sotaWff = "";
    }

    showErrors();
  });

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

function showErrors() {
  if (errors) {
    $(".js-status").html(errors.join("<br>"));
  }
}

$(".js-download-qso").click(function () {
  handleInput();
});

$(".js-load-sample-log").click(function () {
  const logData = `
80m cw
1212 ok1uu okff-1234
3 ok1rr
4 ok1tn
20 dl6kva
5 dj1yfk
ssb
32 ok7wa ol/zl-071
33 ok1xxx  
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
    return "30M";
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

  if (mode !== "CW") {
    return "DIGI";
  }

  return "CW";
}

var htmlSettings = "";
for (const [key, value] of Object.entries(Bands)) {
  htmlSettings =
    htmlSettings +
    "\n\n" +
    `
    <div class="row">
      <div class="col-1">
        <strong>${key.slice(1)}</strong>
      </div>
      <div class="col-1">
        <div class="form-group">
          <label for="${key.slice(1)}CW">CW</label>
          <input type="text" class="form-control text-uppercase" id="${key.slice(
            1
          )}CW" value="${value.cw}">
        </div>							
      </div>
      <div class="col-1">
        <div class="form-group">
          <label for="${key.slice(1)}SSB">SSB</label>
          <input type="text" class="form-control text-uppercase" id="${key.slice(
            1
          )}SSB" value="${value.ssb}">
        </div>							
      </div>
      <div class="col-1">
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

  const adifHeader = `
ADIF export from Simple fast log entry by Petr, OK2CQR

Internet: https://sfle.ok2cqr.com

<ADIF_VER:5>2.2.1
<PROGRAMID:4>SFLE
<PROGRAMVERSION:5>0.0.1
<EOH>

`;

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

    qso = qso + "<EOR>";

    adif = adif + qso + "\n";
  });

  const filename =
    operator.replace("/", "-") +
    "_" +
    mySotaWwff.replace("/", "-") +
    "_" +
    qsodate.replace("-", "").replace("-", "") +
    ".adi";
  download(filename, adif);
});

function getAdifTag(tagName, value) {
  return "<" + tagName + ":" + value.length + ">" + value + " ";
}

function getReportByMode(mode) {
  settingsMode = getSettingsMode(mode);
  if (settingsMode === "SSB") {
    return "59";
  }

  return "599";
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
