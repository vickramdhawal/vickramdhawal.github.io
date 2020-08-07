var urlParams = new URLSearchParams(window.location.search);

var noblock = false;

if (urlParams.has("noblock")) {
    noblock = true;
}

Module["onRuntimeInitialized"] = function () {
    if (noblock) {
        Module.shouldNotBlockMemory();
    }
}

function allocateWASMMemory()
{
    let wasmMemoryRequested = Number(document.getElementById("loadwasmmem").value);
    var MB = 1024 * 1024;
    var numMBToAllocate = 10;
    var int = null;
    var complete = function (success, wasmMemory) {
        clearInterval(int);
        var pText = "Allocation of " + wasmMemory + "MB in WASM memory complete!";
        if (!success) {
            pText += " OUT OF WASM MEMORY";
        }
        addToAlert(pText);
    }
    int = setInterval(() => {
        var success = false;
        var wasmMemory = null;
        try {
            success = Module.tryAllocationToWasm(numMBToAllocate);
            wasmMemory = Number(Module.getWasmMemorySize()) / MB;
            document.getElementById("allocatedWasmMem").value = wasmMemory;
            document.getElementById("myWASMProgress").value = (wasmMemory/wasmMemoryRequested)*100;
            if (!success || wasmMemory >= wasmMemoryRequested) {
                complete(success, wasmMemory);
            }
        }
        catch (e) {
            if (wasmMemory === null) {
                wasmMemory = Number(Module.getWasmMemorySize()) / MB;
            }
            complete(success, wasmMemory);
        }
    }, 40)
}

var arrayOfPtrs = [];
function storePtr(ptr) {
    arrayOfPtrs.push(ptr);
}