import * as interleave from 'bit-interleave';

// mortonize
// ------------------------------------------------------------------------
// Returns a one dimensional value that encodes both latitude and longitude
// while approximate preserving locality. Useful for spatial indexing.
//
// See the following for more detail:
// https://en.wikipedia.org/wiki/Z-order_curve#Use_with_one-dimensional_data_structures_for_range_searching
export default function mortonize(latitude, longitude) {
  // Discretize coordinates into ~100m chunks
  latitude = Math.floor((latitude + 90) * 1000);
  longitude = Math.floor((longitude + 180) * 1000);
  return interleave[2](latitude, longitude);
}
