//em++ --bind App.cpp -s ABORTING_MALLOC=0  -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s DISABLE_EXCEPTION_CATCHING=0 -s ENVIRONMENT='web' -o app.js

#include <emscripten.h>
#include <emscripten/bind.h>

using namespace emscripten;
uint32_t totalSize = 0;
uint32_t num = 0;
constexpr int MB = 1024*1024;

void * operator new(std::size_t size){
    void * mem = std::malloc(sizeof(size_t) + size);
    if(mem == nullptr)
        return mem;
    *(size_t*)mem = size;
    totalSize += size + sizeof(size_t);
    return (void*)&((size_t*)mem)[1];
}

void operator delete(void * mem) throw() {
    totalSize -= ((size_t*)mem)[-1] + sizeof(size_t);
    std::free((size_t*)mem - 1);
}

uint32_t getWasmMemorySize(){
    return totalSize;
}

bool tryAllocationToWasmFromJS(int size_in_mb){
    try {
        int totalBytes = size_in_mb*MB;
        char *c = new char[totalBytes];
        if (!c) {
            return false;
        }
        int count = 0;
        int numToWrite = num % 10;
        while(count < totalBytes) {
            *(c + count) = numToWrite;
            count++;
        }
        ++num;
        EM_ASM({
            storePtr($0);
        }, c);
    }
    catch (...) {
        return false;
    }
    return true;
}

EMSCRIPTEN_BINDINGS(FunctionBindings)
{
    function("getWasmMemorySize", &getWasmMemorySize);
    function("tryAllocationToWasm", &tryAllocationToWasmFromJS);
}