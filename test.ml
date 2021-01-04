module IntervalAlgebra = struct
  type interval = {start: float; end_: float}

  let overlaps (ai : interval) (bi : interval) : bool =
    ai.start <= bi.end_ && ai.end_ >= bi.start

  let before ?(max_dist : float option = None) (ai : interval)
        (bi : interval) : bool =
    let diff = bi.start -. ai.end_ in
    match max_dist with
    | Some dist -> 0. <= diff && diff <= dist
    | None -> 0. <= diff

  let after ?(max_dist : float option = None) (ai : interval)
        (bi : interval) : bool =
    before ~max_dist bi ai

  let (||) f g a b = (f a b) || (g a b)
  let (&&) f g a b = (f a b) && (g a b)
end

let () =
  let open IntervalAlgebra in
  let in_region_of : interval -> interval -> bool =
    overlaps ||
    (before ~max_dist:(Some 10.)) ||
    (after ~max_dist:(Some 10.))
  in

  let ai = {start = 0.; end_ = 10.} in
  let bi = {start = 12.; end_ = 14.} in
  let ci = {start = 25.; end_ = 27.} in

  assert (in_region_of ai bi);
  assert (not (in_region_of ai ci))
