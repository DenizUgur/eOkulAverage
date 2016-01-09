// ==UserScript==
// @name         Parse Table
// @namespace    denizugur
// @version      3.0
// @description  Parses Table
// @author       Deniz
// @include      https://e-okul.meb.gov.tr/IlkOgretim/Veli/IOV02002.aspx
// @grant        none
// ==/UserScript==
var HDPObj = []; //Lesson Number
var LessonsHDP = []; //Lessons
var LessonsNB = []; //Lessons Not Bilgisi
var TArrayI = []; //I.Donem
var IDonemObj = [];
var TArrayII = []; //II.Donem
var IIDonemObj = [];
var totalI = 0;
var totalII = 0;
var totalDers = 0;
var onlyfirstperiod; //II.Donem varmı

function main() {
    //NOTE TABLES
    var tableI = document.getElementById("tblNotlarIDonem").getElementsByClassName("frmDis")[0];
    tableI.id = "d1t";
    try {
        var tableII = document.getElementById("tblNotlarIIDonem").getElementsByClassName("frmDis")[0];
        tableII.id = "d2t";
        onlyfirstperiod = false;
    } catch (err) {
        onlyfirstperiod = true;
    }

    var TArrayI = [];
    var TArrayII = [];
    var lengthOfThisRow = [];
    var averageColumn;
    jQuery("table#d1t tr").each(function() {
        var tableData = jQuery(this).find('td');
        lengthOfThisRow.push(tableData.length);
    });

    var freqs = {};
    var max_index;
    var max_value = -1 / 0; // Negative infinity.

    jQuery.each(lengthOfThisRow, function(i, v) {
        if (freqs[v] != undefined) {
            freqs[v]++;
        } else {
            freqs[v] = 1;
        }
    });
    jQuery.each(freqs, function(num, freq) {
        if (freq > max_value) {
            max_value = freq;
            max_index = num;
        }
    });

    if (max_index != undefined) {
        console.log("Rows: " + max_index);
        averageColumn = max_index - 2;
        console.log("Average Column is " + averageColumn);
    }

    jQuery("table#d1t tr").each(function() {
        var arrayOfThisRow = [];
        var tableData = jQuery(this).find('td');
        if (tableData.length == max_index) {
            tableData.each(function() {
                arrayOfThisRow.push(jQuery(this).text());
            });
            TArrayI.push(arrayOfThisRow);
        }
    });

    if (onlyfirstperiod == true) {
        return false;
    } else {
        jQuery("table#d2t tr").each(function() {
            var arrayOfThisRow = [];
            var tableData = jQuery(this).find('td');
            if (tableData.length == max_index) {
                tableData.each(function() {
                    arrayOfThisRow.push(jQuery(this).text());
                });
                TArrayII.push(arrayOfThisRow);
            }
        });
    }

    var x;
    for (x in TArrayI) {
        var first = TArrayI[x][0];
        var second = TArrayI[x][averageColumn];
        if (first == "") {
            break;
        } else {
            var first = first.replace(/^\s\s*/, '').replace(/\s\s*jQuery/, '');
            //LessonsNB populating
            LessonsNB.push(first);
            //Normal procedure
            var newObj = new LessonAverage(first, second);
            IDonemObj.push(newObj);
        }
    }
    console.log("First period of data has been completed.")

    if (onlyfirstperiod == true) {
        return false;
    } else {
        var x;
        for (x in TArrayII) {
            var first = TArrayII[x][0];
            var second = TArrayII[x][averageColumn];
            if (first == "") {
                break;
            } else {
                var first = first.replace(/^\s\s*/, '').replace(/\s\s*jQuery/, '');
                var newObj = new LessonAverage(first.toString(), second);
                IIDonemObj.push(newObj);
            }
        }
    }
    console.log("Second period of data has been completed.")

    //PROGRAM TABLE
    var div = document.createElement("div")
    div.id = "HaftalikDP";
    document.body.appendChild(div);

    jQuery('#HaftalikDP').load("IOV02003.aspx #dgHafalikProgram", function() {
        jQuery('#HaftalikDP').hide();
        var x = document.getElementById("dgHafalikProgram");
        x.id = "HDP"
        jQuery('table#HDP tr:eq(0)').remove();
        jQuery("table#HDP b").each(function() {
            jQuery(this).remove();
        });
        jQuery("table#HDP br").each(function() {
            jQuery(this).remove();
        });
        jQuery("table#HDP td:contains('-')").remove();
        jQuery("table#HDP td").each(function() {
            var num = jQuery(this).text();
            if (jQuery.isNumeric(num)) {
                jQuery(this).remove();
            }
        });
        countStrings("table#HDP");
    });
}

function countStrings(table) {
    var words = [];
    var uniqueWords = [];

    jQuery(table + " td").each(function() {
        words.push(jQuery(this).text())
    });
    jQuery(words).each(function() {
        for (var i = 0; i < uniqueWords.length; i++) {
            var current = uniqueWords[i];
            if (current.word.toString() == this.toString()) {
                current.count++;
                return;
            }
        }
        uniqueWords.push({
            count: 1,
            word: this
        });
    });
    jQuery(uniqueWords).each(function() {
        LessonsHDP.push(this.word);
        var x = this.word.toString();
        var newObj = new LessonCount(x, this.count);
        HDPObj.push(newObj);
    });
    console.log("Lessons count processing has been completed.");
}

function LessonAverage(subject, average) {
    this.subject = subject;
    this.average = average;
}

function LessonCount(subject, count) {
    this.subject = subject;
    this.count = count;
}

function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];
}

function mathAverage() {
    var resultI = [];
    var resultII = [];
    var dersVal = [];
    //1.Donem
    LessonsNB.forEach(function(value) {
        var x = findElement(IDonemObj, "subject", value)["average"];
        var x = x.replace(",", ".");
        var x = parseFloat(x, 10) //DECIMAL ?
        try {
            var y = parseInt(findElement(HDPObj, "subject", value)["count"]);
        } catch (err) {
            var y = 1;
        }
        resultI.push(x * y);
        dersVal.push(y);
    });
    jQuery.each(resultI, function() {
        totalI += this;
    });
    //2.Donem
    if (onlyfirstperiod == true) {
        return false;
    } else {
        LessonsNB.forEach(function(value) {
            var x = findElement(IIDonemObj, "subject", value)["average"];
            var x = x.replace(",", ".");
            var x = parseFloat(x, 10)
            try {
                var y = parseInt(findElement(HDPObj, "subject", value)["count"]);
            } catch (err) {
                var y = 1;
            }
            resultII.push(x * y);
        });
        jQuery.each(resultII, function() {
            totalII += this;
        });
    }
    jQuery.each(dersVal, function() {
        totalDers += this;
    });
    console.log("Be aware: There might be slight difference from real result.");
    console.log("I. Donem Ortalaması: " + parseFloat(totalI / totalDers).toFixed(2));
    console.log("II. Donem Ortalaması: " + parseFloat(totalII / totalDers).toFixed(2));
}

function displayAverage() {
    var x = parseFloat(totalI / totalDers).toFixed(2);
    var y = parseFloat(totalII / totalDers).toFixed(2);
    var averageColor;

    //1. Dönem
    if (x < 50) {
        var averageColor = "#CF0000";
    }
    if (x >= 50 && x < 70) {
        var averageColor = "#FF9900";
    }
    if (x >= 70 && x < 85) {
        var averageColor = "#0066FF";
    }
    if (x >= 85) {
        var averageColor = "#4BBA25";
    }

    jQuery("table#d1t tr").last().find("td").last().remove();
    jQuery("table#d1t tr").last().find("td").first().html("ORTALAMA");
    jQuery("table#d1t tr").last().find("td").first().css("font-weight", "bold");
    var totalAverage = jQuery("table#d1t tr").last().find("td").last().prev("td");
    totalAverage.attr("id", "averageCol");
    totalAverage.attr("colspan", 2);
    totalAverage.attr("align", "center");
    totalAverage.html(x);
    totalAverage.css("font-weight", "bold");
    totalAverage.css("font-size", "11px");
    totalAverage.css("color", averageColor);
    totalAverage.css("font-family", "Verdana, sans-serif, Arial, Helvetica");

    //2. Dönem
    if (y < 50) {
        var averageColor = "#CF0000";
    }
    if (y >= 50 && y < 70) {
        var averageColor = "#FF9900";
    }
    if (y >= 70 && y < 85) {
        var averageColor = "#0066FF";
    }
    if (y >= 85) {
        var averageColor = "#4BBA25";
    }

    jQuery("table#d2t tr").last().find("td").last().remove();
    jQuery("table#d2t tr").last().find("td").first().html("ORTALAMA");
    jQuery("table#d2t tr").last().find("td").first().css("font-weight", "bold");
    var totalAverage = jQuery("table#d2t tr").last().find("td").last().prev("td");
    totalAverage.attr("id", "averageCol");
    totalAverage.attr("colspan", 2);
    totalAverage.attr("align", "center");
    totalAverage.html(y);
    totalAverage.css("font-weight", "bold");
    totalAverage.css("font-size", "11px");
    totalAverage.css("color", averageColor);
    totalAverage.css("font-family", "Verdana, sans-serif, Arial, Helvetica");
}

function addJQuery() {
    var el = document.createElement('div'),
        b = document.getElementsByTagName('body')[0];
    otherlib = false,
        msg = '';
    el.style.position = 'fixed';
    el.style.height = '32px';
    el.style.width = '220px';
    el.style.marginLeft = '-110px';
    el.style.top = '0';
    el.style.left = '50%';
    el.style.padding = '5px 10px';
    el.style.zIndex = 1001;
    el.style.fontSize = '12px';
    el.style.color = '#222';
    el.style.backgroundColor = '#f99';
    if (typeof jQuery != 'undefined') {
        msg = 'This page already using jQuery v' + jQuery.fn.jquery;
        return showMsg();
    } else if (typeof $ == 'function') {
        otherlib = true;
    }

    function getScript(url, success) {
        var script = document.createElement('script');
        script.src = url;
        var head = document.getElementsByTagName('head')[0],
            done = false;
        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
                success();
                script.onload = script.onreadystatechange = null;
                head.removeChild(script);
            }
        };
        head.appendChild(script);
    }
    getScript('https://code.jquery.com/jquery-latest.min.js', function() {
        if (typeof jQuery == 'undefined') {
            msg = 'Sorry, but jQuery wasn\'t able to load';
        } else {
            msg = 'This page is now jQuerified with v' + jQuery.fn.jquery;
            if (otherlib) {
                msg += ' and noConflict(). Use $jq(), not $().';
            }
        }
        return showMsg();
    });

    function showMsg() {
        if (document.getElementById("averageCol") == null) {
            el.innerHTML = msg;
            b.appendChild(el);
            main();
            mathAverage();
            displayAverage();
        } else {
            el.innerHTML = "Average has already been calculated.";
            b.appendChild(el);
        }
        window.setTimeout(function() {
            if (typeof jQuery == 'undefined') {
                b.removeChild(el);
            } else {
                jQuery(el).fadeOut('slow', function() {
                    jQuery(this).remove();
                });
            }
        }, 1500);
    }
}

addJQuery();
