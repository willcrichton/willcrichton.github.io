fn main() {
  let t = (((0, 1), 2, 3), 4);
  assert!(((t.0).0).1 == 1);
  assert!(t.1 == 4);
  assert!((t.0).2 == 3);
}
