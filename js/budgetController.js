console.log("App has started.");
console.log("Loading controllers.");

/*
Functionality: Manages budget data using the module pattern, tracks income, expenses, budget, and percentage of income represented by expenses.
Parameters: None.
Return Value: Object with public methods for adding items, deleting items, testing data, calculating budget, setting expense percentages, getting expense percentages, and retrieving budget-related data.
*/
var budgetController = (function () {
  // private Expense constructor
  var prvExpense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentageOfExpenseOutOfTotalIncome = -1; // -1 = value can't be calculated yet
  };

  // calculate how much in % an expense represents out of the total income and store this value in
  // prvExpense.percentageOfExpenseOutOfTotalIncome
  // totalIncome  Number  the total of the submited income transactions
  prvExpense.prototype.calculatePercentageOfExpenseOutOfTotalIncome =
    function () {
      if (prvData.totals.inc > 0) {
        var percentageOfExpTotalInc = (this.value / prvData.totals.inc) * 100;

        // round up the second digit based on the third, and shrink the num to just two decimals
        this.percentageOfExpenseOutOfTotalIncome =
          rpJSframework.pblCutNdecimalsFromFloatNum(percentageOfExpTotalInc, 2);
      } else {
        // when we delete all of the expense transactions, we need to reset this variable
        this.percentageOfExpenseOutOfTotalIncome = -1;
      }
    };

  // getter for the prvExpense.percentageOfExpenseOutOfTotalIncome property
  prvExpense.prototype.getPercentageOfSubmitedExpense = function () {
    return this.percentageOfExpenseOutOfTotalIncome;
  };

  // private Income constructor
  var prvIncome = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // object for storing instances of prvExpense, prvIncome, totalExpenses, totalIncomes
  // every expense entered in the UI will map to an instance of prvExpense
  // every income entered in the UI will map to an instance of prvIncome
  var prvData = {
    // object with all the expenses and all of the incomes
    allItems: {
      // all expense transactions
      exp: [],

      // all income transactions
      inc: [],
    },

    // object with expenses total and income total
    totals: {
      // sum of all expense transactions
      exp: 0,

      // sum of all income transactions
      inc: 0,
    },

    // total budget: incomes - expenses
    budget: 0,

    // how much of the total income, in %, the total expenses represent
    // -1 = there is no income submited
    expensesPercentageIncome: -1,
  };

  // calculate total income or total expenses
  // type  String  type of transaction "exp" or "inc"
  var prvCalculateTotal = function (type) {
    var sum = 0;

    // select between the exp or inc array of the prvDate object to calculate the sum of all the values of each object in the array
    prvData.allItems[type].forEach(function (currElem) {
      sum = sum + currElem.value;
    });

    // add this sum to the prvData.totals[exp] or prvData.totals[inc]
    prvData.totals[type] = sum;
  };

  return {
    /*
    Functionality: Creates a new Expense or Income instance based on user input, adds it to the corresponding array, and returns the new instance.
    Parameters:
    type (String): Type of the transaction ("exp" or "inc").
    description (String): Description of the transaction.
    value (Number): Value of the transaction.
    Return Value: New instance of Expense or Income.
    */
    pblAddItem: function (type, descripton, value) {
      // new reference to a new intance of prvExpense or prvIncome
      var newItem;

      // create a unique id to put in each prvExpense or prvIncome item
      var id;

      id =
        prvData.allItems[type].length > 0
          ? prvData.allItems[type][prvData.allItems[type].length - 1].id + 1
          : 0;

      // create new instance of prvExpense or prvIncome based on the type parameter
      if (type === "exp") {
        newItem = new prvExpense(id, descripton, value);
      } else if (type === "inc") {
        newItem = new prvIncome(id, descripton, value);
      }

      // object[property]
      // add expense/income to the prvData.allItems[exp] or prvData.allItems[inc] array
      // based on the type parameter
      prvData.allItems[type].push(newItem);

      // return new instance of prvExpense or prvIncome
      return newItem;
    },

    /*
    Functionality: Deletes a transaction from the appropriate array based on type and ID.
    Parameters:
    transType (String): Type of the transaction ("exp" or "inc").
    transId (Number): ID of the transaction to be deleted.
    Return Value: None.
    */
    pblDeleteItem: function (transType, transId) {
      console.info("transType %s", transType);
      console.info("transId %d", transId);

      var trasactionTypeIds, indexDeleteElem;

      // id = 6
      // [1 2 4 6 8]
      // delete the item at index at which 6 sits

      // create an array with all the ids of the trasactions submited of type transType
      trasactionTypeIds = prvData.allItems[transType].map(function (
        currentElem
      ) {
        return currentElem.id;
      });
      console.info("trasactionTypeIds %O", trasactionTypeIds);

      // get the index of the element with id transId from the trasactionTypeIds array
      indexDeleteElem = trasactionTypeIds.indexOf(transId);
      console.info("indexDeleteElem %O", indexDeleteElem);

      // if the id that was passed to the function is found in the transaction ids
      if (indexDeleteElem !== -1) {
        // detele the item at index idexDeleteElem from the prvData.allItems[transType] array
        prvData.allItems[transType].splice(indexDeleteElem, 1);
      }
      console.info(
        " prvData.allItems[%s] %O",
        transType,
        prvData.allItems[transType]
      );
    },

    /*
    Functionality: Logs the prvData object for testing purposes.
    Parameters: None.
    Return Value: None.
    */
    pblTestGetDataStr: function () {
      console.info("prvData = %O", prvData);
    },

    /*
    Functionality: Calculates the budget, total income, total expenses, and the percentage of expenses relative to income.
    Parameters: None.
    Return Value: None.
    */
    pblCalculateBudget: function () {
      // calculate total income
      prvCalculateTotal("inc");

      // calculate total expenses
      prvCalculateTotal("exp");

      // calculate the budget: income - expenses
      prvData.budget = prvData.totals.inc - prvData.totals.exp;

      // if at least one income transaction was submited
      if (prvData.totals.inc > 0) {
        // 1. calculate the percent of how much the total expenses represent out of the total income.
        // 2. round up the second digit based on the third, and shrink the num to just two decimals
        var percentTotalExpOutOfTotalInc =
          rpJSframework.pblCutNdecimalsFromFloatNum(
            (prvData.totals.exp * 100) / prvData.totals.inc,
            2
          );

        prvData.expensesPercentageIncome = percentTotalExpOutOfTotalInc;
      } else {
        prvData.expensesPercentageIncome = -1;
      }
    },

    /*
    Functionality: Calculates the percentage of each expense relative to total income.
    Parameters: None.
    Return Value: None.
    */
    pblSetPercentageOfExpenseOutOfTotalIncomeForEachExp: function () {
      prvData.allItems.exp.forEach(function (currentElem) {
        currentElem.calculatePercentageOfExpenseOutOfTotalIncome();
      });
    },

    /*
    Functionality: Retrieves an array with the percentage of each expense relative to total income.
    Parameters: None.
    Return Value: Array of percentages.
    */
    pblGetPercentageOfExpenseOutOfTotalIncomeForEachExp: function () {
      var arrayPercentageOfExpenseOutOfTotalIncome;

      arrayPercentageOfExpenseOutOfTotalIncome = prvData.allItems.exp.map(
        function (currentElement) {
          return currentElement.getPercentageOfSubmitedExpense();
        }
      );

      return arrayPercentageOfExpenseOutOfTotalIncome;
    },

    /*
    Functionality: Retrieves budget-related data including budget, total expenses, total income, and expense percentage.
    Parameters: None.
    Return Value: Object with budget-related data.
    */
    pblGetBudgetExpIncExpPercentage: function () {
      return {
        budget: prvData.budget,
        totalExpenses: prvData.totals.exp,
        totalIncome: prvData.totals.inc,
        expensesPercentageIncome: prvData.expensesPercentageIncome,
      };
    },
  };
})();

console.log("budgetController.js has finished loading.");
