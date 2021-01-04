---
layout: post
title: Memory Safety in Rust
subtitle: A Case Study with C
abstract: To demonstrate the value of Rust's memory safety rules, I contrast the implementation of a simple vector library in C and Rust, highlighting where and how Rust's static analysis can prevent tricky memory errors.
---

## Introduction

In all programming that uses memory, we desire two program properties:
1. **Memory safety** is the property of a program where memory pointers used always point to valid memory[^0], i.e. allocated and of the correct type/size. Memory safety is a *correctness* issue---a memory unsafe program may crash  or produce nondeterministic output depending on the bug.
2. **Memory containment** (a term of my own invention[^1]) is the property of a program where memory does not leak, i.e. if a piece of memory is allocated, either it is reachable from the root set of the program, or it will be deallocated eventually. Memory containment is a *performance* issue---a leaky program may eventually run out of memory[^2].

In garbage-collected (GC) languages (e.g. Python and Java), memory safety is guaranteed for all data allocated within the language runtime, assuming a correct implementation of the garbage collector. Memory containment is guaranteed for [tracing garbage collectors](https://en.wikipedia.org/wiki/Tracing_garbage_collection) (like Java), but not necessarily for [reference counting garbage collectors](https://en.wikipedia.org/wiki/Reference_counting) (like Python).

In non-GC languages, i.e. low-level systems languages like C, C++ and Rust, these memory properties must either be guaranteed by the compiler via static analysis (C++ RAII, Rust's borrow checker), or they must be carefully managed by the programmer at runtime (`malloc`/`free`, `new`/`delete`). In particular, C is famous for being a language of footguns, as it offers few built-in constructs to protect the programmer against the dangers of manual memory management.

Many systems programmers and blog posts out there will warn of these hazards, but frequently not in great detail. It is a worthwhile exercise to work through an example of moderate complexity to understand the depth of problems that can occur when dealing with memory in C, and to appreciate how modern static analysis tools can prevent such bugs. Below, I have provided an implementation of a vector library (or resizable array) specialized for integers written in C. It contains at least 7 bugs relating to the properties of memory safety and containment. Take a few minutes to find them, and then we will compare it with an equivalent Rust implementation[^3].

## C implementation

**Disclaimer: this is a contrived example intended to illustrate how memory errors can occur. Some combination of gcc flags, careful reading, gdb, and Valgrind will catch the bugs. An experienced C programmer would not probably not write this... but they might make some of the same mistakes!**

_[Gist link for mobile users.](https://gist.github.com/willcrichton/4d83754cc3c355e10e6060dfb84cc0f9)_

```c
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

// There are at least 7 bugs relating to memory on this snippet.
// Find them all!

// Vec is short for "vector", a common term for a resizable array.
// For simplicity, our vector type can only hold ints.
typedef struct {
  int* data;     // Pointer to our array on the heap
  int  length;   // How many elements are in our array
  int  capacity; // How many elements our array can hold
} Vec;

Vec* vec_new() {
  Vec vec;
  vec.data = NULL;
  vec.length = 0;
  vec.capacity = 0;
  return &vec;
}

void vec_push(Vec* vec, int n) {
  if (vec->length == vec->capacity) {
    int new_capacity = vec->capacity * 2;
    int* new_data = (int*) malloc(new_capacity);
    assert(new_data != NULL);

    for (int i = 0; i < vec->length; ++i) {
      new_data[i] = vec->data[i];
    }

    vec->data = new_data;
    vec->capacity = new_capacity;
  }

  vec->data[vec->length] = n;
  ++vec->length;
}

void vec_free(Vec* vec) {
  free(vec);
  free(vec->data);
}

void main() {
  Vec* vec = vec_new();
  vec_push(vec, 107);

  int* n = &vec->data[0];
  vec_push(vec, 110);
  printf("%d\n", *n);

  free(vec->data);
  vec_free(vec);
}
```

**Don't look past here until you're ready to see the answers.**

<br />

<br />

<br />

Let's review. Here's the bugs:
1. **`vec_new`: `vec` is stack-allocated.** This is an example of a _dangling pointer_. The line `Vec vec;` allocates the struct on the current stack frame and returns a pointer to that struct, however the stack frame is deallocated when the function returns, so any subsequent use of the pointer is invalid. A proper fix is to either heap allocate (`malloc(sizeof(Vec))`) or change the type signature to return the struct itself, not a pointer.

2. **`vec_new`: initial capacity is 0.** When `vec_push` is called, the capacity will double, but `2 * 0 = 0`, resulting in no additional memory being allocated, so space for at least 1 element needs to be allocated up front.

3. **`vec_push`: incorrect call to `malloc`.** The argument to malloc is the size of memory in bytes to allocate, however `new_capacity` is simply the number of integers. We need to `malloc(sizeof(int) * new_capacity)`.

4. **`vec_push`: missing free on resize.** When the resize occurs, we reassign `vec->data` without freeing the old data pointer, resulting in a memory leak.

5. **`vec_free`: incorrect ordering on the `free`s.** After freeing the vector container, the `vec->data` pointer is no longer valid. We should free the data pointer and then the container.

6. **`main`: double free of `vec->data`.** We should not be freeing the vector's data twice, instead only letting `vec_free` do the freeing.

7. **`main`: iterator invalidation of `n`.** This is the most subtle bug of the lot. We start by taking a pointer to the first element in the vector. However, after calling `vec_push`, this causes a resize to occur, freeing the old data and allocating a new array. Hence, our old `n` is now a dangling pointer, and dereferencing it in the `printf` is memory unsafe. This is a special case of a general problem called iterator invalidation, where a pointer to a container is invalidated when the container is modified.

Wow! We managed to pack a lot of bugs into a single program. Still, this program is valid C code; it will successfully compile (although a few of the bugs _will_ at least raise warnings). Now let's see what happens if we try to implement the same code in Rust.

## Rust implementation

```rust
struct Vec2 {
    data: Box<[isize]>,
    length: usize,
    capacity: usize
}

impl Vec2 {
    fn new() -> &Vec2 {
        let v = Vec2 {
            data: Box::new([]),
            length: 0,
            capacity: 0
        };
        return &v;
    }
}

fn main () {}
```

(We call the struct `Vec2` to avoid clashing with the existing `std::vec::Vec`.) Here, if we naively translate the previous C code, this fails to compile:

```
error[E0106]: missing lifetime specifier
 --> v.rs:8:17
  |
8 |     fn new() -> &Vec2 {
  |                 ^ expected lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
  = help: consider giving it a 'static lifetime
```

Rust can identify the dangling stack pointer issue without even looking at the function implementation, but instead by analyzing the type signature of the function. Since the function takes no references as input, it's impossible to return a reference as output, since the output could only be referencing values owned inside the function. Fixing the code, we change the type signature to return an _owned_ vector:

```rust
impl Vec2 {
    fn new() -> Vec2 {
        let v = Vec2 {
            data: Box::new([0]),
            length: 0,
            capacity: 1
        };
        return v;
    }
}
```

Note that the capacity issue is not caught by the compiler--it's a logic error that must be identified by the programmer. That said, if we _didn't_ fix the bug, then the error would at least be an explicit out-of-bounds array error at runtime instead of a segfault for accessing out of bounds memory. Next, we implement the `push` method:

```rust
fn push(&mut self, n: isize) {
    if self.length == self.capacity {
        let new_capacity = self.capacity * 2;
        let mut new_data = unsafe {
            let ptr = Heap::default()
                .alloc(Layout::array::<isize>(new_capacity).unwrap())
                .unwrap() as *mut isize;
            Box::from_raw(slice::from_raw_parts_mut(ptr, new_capacity))
        };

        for i in 0..self.length {
            new_data[i] = self.data[i];
        }

        self.data = new_data;
        self.capacity = new_capacity;
    }

    self.data[self.length] = n;
    self.length += 1;
}
```

This method compiles and works correctly. It does not contain an explicit `free(self.data)`, since Rust will automatically deallocate the old value of `self.data` when it is reassigned--this is based on Rust's lifetime analysis, which determines that the lifetime of the old array ends at variable reassignment. Since the programmer does not have to ever explicitly free allocated memory, this eliminates both the associated memory leaks as well as double frees.

The memory allocation used here is highly unusual and non-idiomatic for Rust. Essentially all memory allocations happen either implicitly on the stack by declaring a value (e.g. `new_capacity` here is stack-allocated, assuming it's not in a register), or they happen explicitly on the heap when using [`Box`](https://doc.rust-lang.org/std/boxed/struct.Box.html) or any pointer type derived from it. With these interfaces, Rust automatically allocates memory of the appropriate size and alignment. For example:

```rust
struct Point { x: f32, y: f32 }
let p: Box<Point> = Box::new(Point{ x: 0.1, y: 0.2 });
```

Rust determines the size of `Point`, and does the appropriate `malloc(sizeof(Point))` behind the scenes. Returning to our `push` method, the canonical way to allocate a variable-sized array is to use the [`Vec`](https://doc.rust-lang.org/std/vec/struct.Vec.html) API, however it feels like cheating to use `Vec` to implement a vector library, so we're doing it the hard way.

Here, we make a call to the memory allocator using the unstable [`Heap`](https://doc.rust-lang.org/std/heap/struct.Heap.html) API (this example requires nightly to compile) which provides us a raw pointer `ptr` to the allocated data. Raw pointers in Rust are memory regions unmanaged by the Rust compiler, which means Rust does not ensure memory safety (preventing invalid accesses) or memory containment (deallocating the pointers) for such pointers. However, Rust provides the ability to take ownership of raw pointers, which we do using [`slice::from_raw_parts_mut`](https://doc.rust-lang.org/std/slice/fn.from_raw_parts_mut.html) and [`Box::from_raw`](https://doc.rust-lang.org/std/boxed/struct.Box.html#method.from_raw) which tells Rust to treat the memory pointer as a heap-allocated array. After transferring ownership, assuming the memory is valid and of the right size/type, Rust applies its usual memory safety and containment checks.

Notably, in order to perform these operations, we had to explicitly mark the code as `unsafe`. This is valuable since if our Rust program were to segfault due to an incorrect implementation of unsafe code, it is much easier to debug by only looking at the relevant unsafe code, rather than consider bugs that could span an entire codebase.

We do not have to implement the `vec_free` function, since Rust automatically generates the appropriate destructors for composite data structures, i.e. when the `Vec2` struct is deallocated, Rust knows to first deallocate the boxed array and then deallocate the container, avoiding the free ordering error as well as the double free. Lastly, if we translate the main function:

```rust
fn main() {
    let mut vec: Vec2 = Vec2::new();
    vec.push(107);

    let n: &isize = &vec.data[0];
    vec.push(110);
    println!("{}", n);
}
```

This fails to compile with the following error:

```
error[E0502]: cannot borrow `vec` as mutable because `vec.data[..]` is also borrowed as immutable
  --> v.rs:50:5
   |
49 |     let n: &isize = &vec.data[0];
   |                      ----------- immutable borrow occurs here
50 |     vec.push(110);
   |     ^^^ mutable borrow occurs here
51 |     println!("{}", n);
52 | }
   | - immutable borrow ends here
```

Even the tricky iterator invalidation error is caught by the compiler due to its rules around borrowing and mutability. Taking a pointer to an element of the vector borrows the whole vector immutably, while `push` requires mutable access to the vector, so the compiler spots the conflict and raises an error.

[Find the full Rust code here.](https://gist.github.com/willcrichton/761fb7c340a82aecc12cde3144515be5)

In sum, the guarantees provided by Rust helped us fix every memory-related error in our buggy C implementation (with the exception of the capacity issue, which at least would have had a better error message). And remember--these are _guarantees_, meaning no matter how large your code base, Rust enforces them everywhere, all the time[^4]. Because if we can pack so many memory errors into 50 lines of C, imagine the nightmare of a large codebase. All this, of course, comes at the price of fighting with Rust's borrow checker, both the initial learning curve as well as working around its limitations (see: [non-lexical lifetimes](http://smallcultfollowing.com/babysteps/blog/2016/04/27/non-lexical-lifetimes-introduction/)), but for a codebase of sufficient scale, the pain is quite likely worth the payoff.


[^0]: I've seen "memory safety" used to refer to any kind of memory-related bug (e.g. so says [Wikipedia](https://en.wikipedia.org/wiki/Memory_safety)), but I think it's more useful to distinguish between issues of correctness and performance rather than lumping them under the same term.
[^1]: Someone has pointed out to me that the canonical term for this is in the PL community is "safe-for-space," so use that if you intend to Google related work.
[^2]: Assuming a program properly checks for failures during memory allocation, I don't consider a memory leak a correctness issue since it doesn't necessarily induce a crash.
[^3]: Although Rust is the language of choice, C++ also contains many constructs to help ameliorate the issues contained in the C implementation--however, they are usually less strictly enforced by the compiler.
[^4]: Memory containment is not strictly enforced, however, if one chooses to use [reference counting](https://doc.rust-lang.org/std/rc/struct.Rc.html). And of course, neither safety nor containment are enforced where code is explicitly marked unsafe, but in practice, this happens infrequently except around boundaries to C code.
