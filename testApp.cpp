// emcc --bind -g4 *.c* -D EMMALLOC_DEBUG_LOG -s WASM=1  -s 'MALLOC="none"' -s ALLOW_MEMORY_GROWTH=1 -s DISABLE_EXCEPTION_CATCHING=0 -s ENVIRONMENT='web' -o app.js --source-map-base http://localhost:8000/
#include <emscripten.h>
#include <emscripten/bind.h>

using namespace emscripten;
uint32_t totalSize = 0;
uint32_t num = 1;
constexpr int MB = 1024*1024;
char *globalstr=nullptr;
bool doOnce = true;

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

void blockXMB(int size_in_mb) {
    int sizeMB = size_in_mb * MB;
    globalstr = (char*)malloc(sizeMB);
    int count = 0;
    int numToWrite = num % 10;
    while(count < sizeMB) {
        *(globalstr + count) = numToWrite;
        count++;
    }
    EM_ASM({
        storePtr($0);
    }, globalstr);
}

void freeXMB() {
    printf("Freeing the blocked mem\n");
    free(globalstr);
}

bool tryAllocationToWasmFromJS(int size_in_mb){
    if (doOnce && globalstr == nullptr) {
        blockXMB(50);
        doOnce = false;
    }
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
        printf("FAILED\n");
        return false;
    }
    return true;
}

int main() {
    // blockXMB(300);
}

EMSCRIPTEN_BINDINGS(FunctionBindings)
{
    function("blockXMB", &blockXMB);
    function("freeXMB", &freeXMB);
    function("getWasmMemorySize", &getWasmMemorySize);
    function("tryAllocationToWasm", &tryAllocationToWasmFromJS);
}