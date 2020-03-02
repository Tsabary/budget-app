//BUDGET CONTROLLER
var budgetController = (function() {
  // Expense constructor
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    this.percentage =
      totalIncome > 0 ? Math.round((this.value / totalIncome) * 100) : -1;
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  // Income constructor
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = type => {
    var sum = 0;
    data.allitems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allitems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: (type, des, val) => {
      var newItem, ID;

      ID = !!data.allitems[type].length
        ? data.allitems[type][data.allitems[type].length - 1].id + 1
        : 0;

      switch (type) {
        case "exp":
          newItem = new Expense(ID, des, val);
          console.log(newItem);
          break;
        case "inc":
          newItem = new Income(ID, des, val);
          break;
      }
      data.allitems[type].push(newItem);

      return newItem;
    },
    deleteItem: (type, id) => {
      var ids, index;

      ids = data.allitems[type].map(item => {
        return item.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allitems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      // Calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // Calculate the budget: income - budget
      data.budget = data.totals.inc - data.totals.exp;

      // If we had income, calculate the percentage of income that we've spent
      !!data.totals.inc
        ? (data.percentage = Math.round(
            (data.totals.exp / data.totals.inc) * 100
          ))
        : (data.percentage = -1);
    },

    calculatePercentages: () => {
      data.allitems.exp.forEach(cur => {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: () => {
      var allPercentages = data.allitems.exp.map(cur => {
        return cur.getPercentage();
      });
      return allPercentages;
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: () => {
      console.log(data);
    }
  };
})();

//UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLable: ".budget__income--value",
    expensesLable: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = (num, type) => {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");

    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var NodeListForEach = (list, callback) => {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be either in or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: (obj, type) => {
      var html, newHtml, element;
      // Create HTML string with placeholder text

      element =
        type === "inc"
          ? DOMstrings.incomeContainer
          : DOMstrings.expensesContainer;

      html =
        type === "inc"
          ? '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          : '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      // Replace the placeholder ext with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: selectorID => {
      var el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);
    },
    clearFields: () => {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: obj => {
      var type;

      obj.budget > 0 ? (type = "inc") : "exp";

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLable
      ).textContent = formatNumber(obj.totalExp, "exp");
      document.querySelector(DOMstrings.percentageLabel).textContent =
        obj.percentage > 0 ? obj.percentage + "%" : "---";
    },

    displayPercentages: percentages => {
      var fields = document.querySelectorAll(
        DOMstrings.expensesPercentageLabel
      );

      NodeListForEach(fields, (current, index) => {
        percentages[index] > 0
          ? (current.textContent = percentages[index] + "%")
          : "---";
      });
    },
    displayMonth: () => {
      var now, year, month, months;
      now = new Date();
      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      month = months[now.getMonth()];
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        month + " " + year;
    },
    changeType: () => {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          ", " +
          DOMstrings.inputValue
      );

      NodeListForEach(fields, cur => {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },
    getDOMstrings: () => {
      return DOMstrings;
    }
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeneres = () => {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", e => {
      if (e.keyCode === 13 || e.which === 13) ctrlAddItem();
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };

  var updateBudget = () => {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on th UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = () => {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentage from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentage
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = () => {
    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && !!input.value) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear fields
      UICtrl.clearFields();

      // 5. Claculate and update budget
      updateBudget();

      // 6. Update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = e => {
    var itemID, splitID, type, ID;

    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item form the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Update percentages
      updatePercentages();
    }
  };

  return {
    init: () => {
      console.log("Application has started");
      UICtrl.displayMonth();
      setupEventListeneres();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  };
})(budgetController, UIController);

controller.init();
