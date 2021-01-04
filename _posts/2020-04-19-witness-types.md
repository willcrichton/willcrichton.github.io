---
layout: post
title: Enforcing Access Control with the Witness Pattern
abstract: >-
    TODO
---

Many programming systems use access control, or statements of the form "once you have permission X, you can take action Y". For example:

* Once you are [a website administrator](https://rocket.rs/v0.4/guide/requests/#request-guards), you can delete an existing user.
* Once you have [locked a mutex](https://doc.rust-lang.org/std/sync/struct.MutexGuard.html), you can read/write the data it protects.
* Once your GPIO pin is [configured as an input](https://rust-embedded.github.io/book/static-guarantees/design-contracts.html), you can read from the pin.

A good system design will enforce the converse of these statements. If you _have not_ locked a mutex, you _can not_ read/write the data it protects. In this note, I'll show you how the **witness pattern** enforces these constraints in Rust.

## Witnesses

A witness is a data structure that demonstrates a capability. Consider the example of a website administrator deleting a user. To represent an administrator, we want to enforce the guarantee: a user can _only_ become an administrator by logging in. In Rust, this looks like:

```rust
mod admin {
  pub struct Admin(());

  impl Admin {
    pub fn login(username: &str, password: &str) -> Option<Admin> {
      if username == "will" && password == "correcthorsebatterystaple" {
        Some(Admin(()))
      } else {
        None
      }
    }
  }
}
```

Here, the `Admin` struct acts as a witness. If our program has a value of type `Admin`, then that is proof that we _must_ have logged in via the static method `Admin::login`. In Rust, the exclusivity of the construction is enforced by private-by-default object constructors. For example, if I tried to build an `Admin` without using `login` outside the `admin` module:

```rust
use admin::Admin;
let a: Admin = Admin(());
```

Then the compiler will fail with the error:

```
error[E0603]: tuple struct constructor `Admin` is private
   |
2  |   pub struct Admin(());
   |                    -- a constructor is private if any of the fields is private
...
25 |   let admin= admin::Admin(());
   |                     ^^^^^ private tuple struct constructor
```

To use an `Admin` as a witness, we make it a parameter to the guarded action. For example, deleting a user looks like this:

```rust
mod actions {
  use super::admin::Admin;

  pub fn delete_user(_admin: Admin, username: &str) {
    // delete user by username
  }
}
```

To recap, the logic goes like this:
* Because `delete_user` requires an `Admin` parameter, the function cannot be called without a value of type `Admin`.
* Because a value of type `Admin` can only be built through `Admin::login`, the user must have actually logged in as an administrator.
* Hence, `delete_user` can logically only be accessed by an administrator.

In this example, `_admin` is a witness because even though it may not be used in `delete_user`, its existence demonstrates proof of a capability. Next, we'll see how we can use the witness directly to perform actions.

## Guards

Another instance of the witness pattern is a [guard](https://github.com/rust-unofficial/patterns/blob/master/patterns/RAII.md). Guards are data structures that mediate access to data. Guards are normally explained as janitors that clean up resources (i.e. RAII), but I think it's useful to understand guards as witnesses. Consider a version of Rust's mutex, but without a guard. We start with a [`SystemMutex`](https://gist.github.com/willcrichton/77460f3b9c6cc811468b9879445c106b), and then create a container:

```rust
struct Mutex<T> {
  t: UnsafeCell<T>,
  mutex: SystemMutex
}


impl<T> Mutex<T> {
  fn new(t: T) -> Mutex<T> {
    Mutex { t: UnsafeCell::new(t), mutex: SystemMutex::new() }
  }

  fn lock(&self) -> &mut T {
    self.mutex.lock();
    unsafe { &mut *self.t.get() }
  }

  fn unlock(&self) {
    self.mutex.unlock();
  }
}
```

What could go wrong with this interface? Certainly the RAII problem: we can forget to unlock the mutex. But that's a potential deadlock, not a correctness issue. Instead, we can violate Rust's ownership rules:

```rust
let m: Mutex<i32> = Mutex::new(1);
let n: &mut i32 = {
  let n = m.lock();
  m.unlock();
  n
};

let n2 = m.lock();
*n += 1;
*n2 += 1;
assert_eq!(*n, 3);
```

Uh oh! We have two mutable pointers to the same data. Why does the interface allow this? Because it does not require that pointers to the mutex's data are gone before unlocking. The solution is, of course, to use a guard. *Because a guard serves as a witness to the state of the mutex*{:class="hl"} --- if you have a value of type `MutexGuard`, that is proof that you have locked the mutex.

To fix up our interface, we change `lock` to return a `MutexGuard` and remove `unlock` entirely. Similar to how an admin could only be created through `login`, our mutex should only be unlocked via `MutexGuard::drop`.

```rust
impl<T> Mutex<T> {
  pub fn new(data: T) -> Mutex<T> {
    Mutex {
      data: UnsafeCell::new(data),
      mutex: SystemMutex::new(),
    }
  }

  pub fn lock<'a>(&'a self) -> MutexGuard<'a, T> {
    self.mutex.lock();
    MutexGuard { mutex: self }
  }
}
```

Then our `MutexGuard` needs to a) allow access to the inner data, and b) unlock the mutex when the guard is dropped.

```rust
pub struct MutexGuard<'a, T> {
  mutex: &'a Mutex<T>,
}

impl<'a, T> Drop for MutexGuard<'a, T> {
  fn drop(&mut self) {
    self.mutex.mutex.unlock();
  }
}

impl<'a, T> Deref for MutexGuard<'a, T> {
  type Target = T;

  fn deref(&self) -> &T {
    unsafe { &*self.mutex.data.get() }
  }
}
```

To verify our witness works correctly, we can try to reuse the illicit example:

```rust
let m: Mutex<i32> = Mutex::new(1);
let n: &mut i32 = {
  let mut n = m.lock();
  &mut *n
};
```

And indeed, the compiler throws an error:

```
error[E0597]: `n` does not live long enough
    |
139 |       &mut *n
    |       ------^
    |       |     |
    |       |     borrowed value does not live long enough
    |       borrow later used here
140 |     };
    |     - `n` dropped here while still borrowed
```

When viewed as a witness, we can see that a `MutexGuard` is not a convenience, a janitor that saves an extra `.unlock()`. Instead, a `MutexGuard` is necessary for the correctness of the `Mutex` API.

## State machines

The witness pattern is closely related to the idea of encoding state machines in the type system (or "typestate"), which has been [explored](http://cs242.stanford.edu/f19/lectures/08-2-typestate) [elsewhere](https://yoric.github.io/post/rust-typestate/) [at](https://blog.systems.ethz.ch/blog/2018/a-hammer-you-can-only-hold-by-the-handle.html) [length](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/).
