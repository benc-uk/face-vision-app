let colours = [
  "#0BE3F1",
  "#F1E30B",
  "#FC8800",
  "#11E20C",
  "#5E98EF",
  "#D70EF5",
  "#F20829", 
  "#5EF7CA"
]

function randomColor() {
  return colours[Math.floor(Math.random() * Math.floor(colours.length))];
}