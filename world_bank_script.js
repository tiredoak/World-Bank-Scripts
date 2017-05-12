// Global variables
var ss = SpreadsheetApp.openById("1Kbh37qLZ-aAg9uIVfvJu7oG0j1_iL-VQQY13415235");
var isoCodes = ss.getSheetByName("ISO codes");

// Makes an API request to world bank for a certain country, indicator pair
function getIndicatorData(country, indicator) {
  
  var url = 'http://api.worldbank.org/countries/' + country + '/indicators/' + indicator +'?date=2012:2016&format=json';
  var options = {
    'method': 'get'
  };

  var response = UrlFetchApp.fetch(url, options);  
  var json = response.getContentText();
  var data = [JSON.parse(json), response];
  return data;
}

// Gets all the countries listed in the "ISO codes" sheet
// and returns them in an array format
function getCountries() {
  var rowOffset = 2;
  var range = isoCodes.getRange(rowOffset, 1, isoCodes.getLastRow() - rowOffset + 1).getValues();
  var countries = [];
  for (country in range) {
    countries.push(range[country][0]);
  }
  return countries;
}

// Gets the range of indicators for a given sheet
function getIndicators(sheetName) {
  var rowOffset = 2;
  var lastRow = ss.getSheetByName(sheetName).getLastRow();
  var range = ss.getSheetByName(sheetName).getRange(rowOffset, 2, lastRow - rowOffset + 1).getValues();
  var indicators = [];
  for (indicator in range) {
    indicators.push(range[indicator][0]);
  }
  return indicators;
}

// Writes the values in every single country sheet
function writeAll() {
  var allSheets = ss.getSheets();
  var countries = [];
  var isoCodes = [];
  // Check if sheet has an isoCode and only includes the ones who do
  for (sheet in allSheets) {
    var isoCode = getIsoCode(allSheets[sheet].getName());
    if (isoCode == -1) {
      continue;
    } else {
      countries.push(allSheets[sheet].getName());
      isoCodes.push(isoCode);
    }
  }
  for (country in countries) {
    writeToSheet(countries[country], isoCodes[country]);
  }
}

// Writes values to an individual sheet
function writeToSheet(sheetName, isoCode) {
  var country = ss.getSheetByName(sheetName);
  var indicators = getIndicators(sheetName);
  // Loop through all indicators
  var row = [];
  for (var i = 0; i < indicators.length; i++) {
    var fullRow = [];
    // Set years to number of years in analysis
    var years = 4;
    // If row corresponds to empty line, skip it
    if (indicators[i] == '') {
      for (var k = 0; k < years; k++) {
        fullRow.push('');
      }
    } else { 
      var data = getIndicatorData(isoCode, indicators[i]); 
      for (var j = 0; j < years; j++) {
        // Parse API response
        var name = data[0][1][j];
        var year = name.date;
        // Check if year matches the header
        if (year == country.getRange(1, 3 + j).getValue()) { // change this to cache year values at the top
          name.value == null ? fullRow.push('') : fullRow.push(name.value);
        } else {
          name.value == null ? fullRow.push('') : fullRow.push(name.value);
        }
      }
    }
    row.push(fullRow);
  }
  var rowOffset = 2;
  // Writes the values to the correct sheet's range
  var range = country.getRange(rowOffset, 3, row.length, fullRow.length);
  range.setValues(row);
}

// Returns string with ISO code for the country
function getIsoCode(country) {
  var rowOffset = 2;
  var range = isoCodes.getRange(rowOffset, 1, isoCodes.getLastRow()).getValues();
  var row = 0;
  var lastRow = isoCodes.getLastRow();
  var from = 0;
  var to = range.length;
  // Binary search through countries
  while (from <= to) {
    var mid = Math.round(((from + to) / 2));
    // Check if mid is within range
    if (mid < 0 || mid == range.length) return -1;
    if (range[mid][0] == country) return isoCodes.getRange(mid + rowOffset, 2).getValue();
    if (range[mid][0] < country) {
      from = mid + 1;
    }
    if (range[mid][0] > country) {
      to = mid - 1;
    }
  }
  return -1;
}

function deleteAllSheets() {
  var sheets = ss.getSheets();
  for (var i = 5; i < sheets.length; i++) {
  }
}
