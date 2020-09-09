let budgetController = (function (){
    
    function IncomeConst(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    function ExpenseConst(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    ExpenseConst.prototype.calculatePercentages = function(totalIncome){
        if(totalIncome > 0) this.percentage = Math.round((this.value / totalIncome) * 100);
        return this.percentage;
    };

    let budgetData = {
        first:{
            exp:[],
            inc:[]
        },
        second:{
            exp:0,
            inc:0
        },
        percentage: -1
    }
    return {
        getObj: function(inputValue){
            let newInstance, ID;

            if(budgetData.first[inputValue.typeValue].length === 0) ID = 0;
            else ID = budgetData.first[inputValue.typeValue][budgetData.first[inputValue.typeValue].length - 1].id + 1;

            if(inputValue.typeValue === 'inc'){
                newInstance = new IncomeConst(ID, inputValue.descValue, inputValue.amountValue);
            }else if (inputValue.typeValue === 'exp'){
                newInstance = new ExpenseConst(ID, inputValue.descValue, inputValue.amountValue);
            }
            budgetData.first[inputValue.typeValue].push(newInstance);

            UIController.displayItems(inputValue, ID);
        },
        
        budgetItemDelete: function(type,id){
            let newData = budgetData.first[type].map(x => x.id);
            let index = newData.indexOf(id);

            if(index !== -1){
                budgetData.first[type].splice(index, 1);
            }
        },
        calcPercent: function(){
            budgetData.first.exp.forEach(x => x.calculatePercentages(budgetData.second.inc));
        },
        getCalcPercent: function(){
            let percentResult = budgetData.first.exp.map(x => x.percentage);
            return percentResult;
        },
        budgetData: budgetData,
        budgetSum :function (type){
            let sum = 0;
            budgetData.first[type].forEach(x => {
                sum += x.value;
            });
            
            budgetData.second[type] = sum;
        },

        percentageFinder: function (){
            if(budgetData.second.inc > 0){
                budgetData.percentage = Math.round((budgetData.second.exp / budgetData.second.inc) * 100);
            }
        }
    }
})();

let UIController = (function (){

    let domString = {
        selectString:'.select',
        descString:'description',
        amountString:'amount',
        btn: '.btn',
        income: '.income',
        expense: '.expense',
        totalBudget: 'total-budget',
        expPercent: '.expense-perc',
        bottomCenter: '.bottom-center',
        expPer: '.expense-percent',
        currentDate: '.current-date'
    };

    return {
        getInput: function(){
            //  types
            return {
                typeValue: document.querySelector(domString.selectString).value,
                descValue: document.getElementById(domString.descString).value,
                amountValue: parseFloat(document.getElementById(domString.amountString).value)
            }
        },
        domStringMethod : function(){
            return domString;
        },
        // add items on UI
        displayItems: function(inputValue,ID){
            let html;

                if(inputValue.typeValue === 'inc'){
                    html = `
                    <div class="item income-item" id="inc-${ID}">
                        <p class="item-name">${inputValue.descValue}</p>
                        <span class="income-item-span item-span">
                            <p class="item-price income-item-price">${inputValue.amountValue}</p>
                            <button><i class="fas fa-trash delete-item"></i></button>
                        </span>
                    </div>
                    `
                } else if(inputValue.typeValue === 'exp'){
                    html = `
                    <div class="item expense-item" id="exp-${ID}">
                        <p class="remove-item-name">${inputValue.descValue}</p>
                        <span class="expense-item-span item-span">
                            <p class="item-price expense-item-price">${inputValue.amountValue}</p>
                            <p class="expense-percent exp_per">0</p>
                            <button><i class="fas fa-trash delete-item"></i></button>
                        </span>
                    </div>
                    `
                }
    
                document.querySelector(`.${inputValue.typeValue}`).insertAdjacentHTML('beforeend',html);
            
            
        },
        clearField: function(){
            let field;
            field = document.querySelectorAll(`#${domString.descString} , #${domString.amountString}`);
            field.forEach( x => x.value = "");
        },
        UIDeleteItem: function(itemID){
            document.getElementById(itemID).remove();
        },
        dataDisplay: function(budgetData){
            document.querySelector(domString.income).textContent = budgetData.second.inc;
            document.querySelector(domString.expense).textContent = budgetData.second.exp;
            document.getElementById(domString.totalBudget).textContent = budgetData.second.inc - budgetData.second.exp;

            document.querySelector(domString.expPercent).textContent = budgetData.percentage;
        },
        expPercentDisplay: function(getcalcperc){
            let percArr= document.querySelectorAll(domString.expPer);

            function percentForEach(arr,callback){
                for(let i = 0;i < arr.length;i++){
                    callback(arr[i],i);
                }
            }

            percentForEach(percArr,(cur,ind) => {
                cur.textContent = getcalcperc[ind];
            });
        },
        calcDate: function(){
            let date = new Date;

            let months = ['Jan','Feb','March','April','May','June','July','August','Sept','Oct','Nov','Dec'];
            let month = date.getMonth();
            let year = date.getFullYear();
            document.querySelector(domString.currentDate).textContent = `${months[month]} ${year}`;
        }

    }
    

})();

let controller = (function (budget,UIBudget){

    // for events
    function setEventHandler(){
        let DOM = UIBudget.domStringMethod();

        document.querySelector(DOM.btn).addEventListener('click',inputFunc);
        document.addEventListener('keypress',(e) => {
            if(e.keyCode === 13){
                inputFunc();
            }
        });
    
        // useless code just for changing the color like bootstrap
        document.querySelector('.select').addEventListener('change',function(){
            for(let i = 0;i < 2; i++) document.querySelectorAll(".main-input")[i].classList.toggle('passiveActive');
        });

        document.querySelector(DOM.bottomCenter).addEventListener('click',deleteItem);
    }

    function percentageCalc(){
        // 1. calculate percentage.
        budget.calcPercent();
        let getcalcperc = budget.getCalcPercent();
        
        // 2. display it on UI.
        UIBudget.expPercentDisplay(getcalcperc);
    }

    function updateBudget(){
        budget.budgetSum('inc');
        budget.budgetSum('exp');
        budget.percentageFinder();
        // show it on UI
        UIBudget.dataDisplay(budget.budgetData);
        percentageCalc();
    }
    // for inputs
    function inputFunc(){
        // now it is object that stores inputs value;
        let inputValues = UIBudget.getInput();

        if(inputValues.descValue !== "" && !isNaN(inputValues.amountValue) && inputValues.amountValue > 0){
        
            // Get objects based on input, from budgetCont;
        budget.getObj(inputValues);
        // clear fields
        UIBudget.clearField();
        // calling updateBudget
        
        updateBudget();
        }
    }

    function deleteItem(e){
        let itemID, splitItemID, itemType, splitID; 
        
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitItemID = itemID.split('-');
            itemType = splitItemID[0];
            splitID = parseInt(splitItemID[1]);
            
            budget.budgetItemDelete(itemType,splitID);
            UIBudget.UIDeleteItem(itemID);

            updateBudget();
        }
    }

    return {
        init: function(){
            setEventHandler();
            UIBudget.calcDate();
        }
    }
    
})(budgetController, UIController);

controller.init();