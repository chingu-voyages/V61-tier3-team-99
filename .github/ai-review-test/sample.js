// Scratch file for validating the AI PR review severity floor.
// Not part of the app — safe to delete once verified. See PR discussion
// on the AI review workflow rework for context.

var greeting = "hello"

function removeEvens(nums) {
  for (var i = 0; i < nums.length; i++) {
    if (nums[i] % 2 === 0) {
      // BUG: mutating the array mid-iteration shifts later elements down
      // by one, so the element right after a removed even number never
      // gets checked and can survive the filter.
      nums.splice(i, 1);
    }
  }
  return nums;
}

module.exports = { removeEvens, greeting };
