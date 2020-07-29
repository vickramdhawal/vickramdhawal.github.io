"use strict"

var urlParams = new URLSearchParams(window.location.search);

var slowAllocation = false;

if (urlParams.has("slow")) {
    slowAllocation = true;
}

var arrLength = null;
var subArrLength = 10 * 1024 * 1024; // 10MB
var progressInterval = 10 * 1024 * 1024;
var MB = 1024 * 1024;

if (slowAllocation) {
    subArrLength = 1024 * 1024; // 1MB
    progressInterval = 1024 * 1024;
}

var arr = null;
var counter = 0;
var totalAllocatedMem = 0;
var isChrome = window.navigator.userAgent.includes("Chrome");
var intSize = 8;
if (isChrome) {
    intSize = 4;
}

function jsallocate(mem, counter) {
   let subArr =  mem[counter] = Array(subArrLength).fill(0);
    for(let i = 1; i <= subArrLength; i++) {
        subArr[i-1] = (i-1);
        totalAllocatedMem++;
        if (i%progressInterval === 0) {
            document.getElementById("allocatedMem").value = (totalAllocatedMem)/MB * intSize;
            document.getElementById("myProgress").value = (totalAllocatedMem/(arrLength*subArrLength))*100;
        }
    }
    if (++counter === arrLength) {
        setTimeout(()=>{
            var pText = "Allocation of " + (Number(document.getElementById("allocatedMem").value)) + "MB in JS Heap complete!";
            addToAlert(pText);
        }, 100);
        return;
    }
    setTimeout(()=>{
        jsallocate(arr, counter);  
    }, 100);
}

function allocateJSHeap() {
    let jsHeapSizeRequested = document.getElementById("loadjsheap").value;
    if (slowAllocation) {
        arrLength = (jsHeapSizeRequested / intSize);
    } else {
        arrLength = (jsHeapSizeRequested / intSize) / 10;
    }
    arrLength = Number(parseInt(arrLength, 10));
    arr = [...Array(arrLength)].map(x => []);
    setTimeout(()=>{
        jsallocate(arr, counter);
    }, 100);
}

window.onerror = function () {
    var pText = "Allocation failed, allocated " + document.getElementById("allocatedMem").value + "MB."
    addToAlert(pText);
}
