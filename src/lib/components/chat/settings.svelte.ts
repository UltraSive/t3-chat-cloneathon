let model = $state("");

export function getModel() {
  return model;
}

export function setModel(selected) {
  model = selected;
};