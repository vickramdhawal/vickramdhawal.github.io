function allocateWASMMemory()
{
    let wasmMemoryRequested = Number(document.getElementById("loadwasmmem").value);
    var MB = 1024 * 1024;
    var numMBToAllocate = 10;
    var int = setInterval(() => {
        var success = Module.tryAllocationToWasm(numMBToAllocate);
        var wasmMemory = Number(Module.getWasmMemorySize()) / MB;
        document.getElementById("allocatedWasmMem").value = wasmMemory;
        document.getElementById("myWASMProgress").value = (wasmMemory/wasmMemoryRequested)*100;
        if (!success || wasmMemory >= wasmMemoryRequested) {
            clearInterval(int);
            var pText = "Allocation of " + wasmMemory + "MB in WASM memory complete!";
            if (!success) {
                pText += " OUT OF WASM MEMORY";
            }
            addToAlert(pText);
        }
    }, 100)
}

var arrayOfPtrs = [];
function storePtr(ptr) {
    arrayOfPtrs.push(ptr);
}