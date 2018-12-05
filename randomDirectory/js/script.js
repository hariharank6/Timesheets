Handlebars.template.index = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.links : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.links : stack1),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "						<a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" href=\""
    + container.escapeExpression(container.lambda((depth0 != null ? depth0.url : depth0), depth0))
    + "\">\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "						</a> \n";
},"4":function(container,depth0,helpers,partials,data) {
    return "								"
    + container.escapeExpression(container.lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"mdl-grid demo-content\" style=\"z-index : 99999999\">\n    <div class=\"demo-charts demo-card-wide mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid\">\n        <div class=\"mdl-card__title\">\n            <h2 class=\"mdl-card__title-text\">Welcome</h2>\n        </div>\n        <div class=\"mdl-card__supporting-text\">\n            A small web app based on Nodejs and Mongodb to automate the TimeSheet processes.\n            <div> As of now, it can track who haven't filled the sheet making compliance much easier.</div>\n            <div>By authorizing this app, <b>your passwords are never shared.</b> Rather than that, authorisation tokens were provided by google to access your data.</div>\n            <div>You can revoke access anytime using, <a>myaccount.google.com/permissions?pli=1</a></div>\n        </div>\n        <div class=\"mdl-card__actions mdl-card--border\">\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.data : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n    </div>\n</div>";
},"useData":true});

Handlebars.template.preferences = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.preferences : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = ((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.preferences : stack1)) != null ? stack1.availableDepartments : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "					<div class=\"mdl-cell--10-col\">\n						<div class=\"mdl-cell--10-col mdl-textfield mdl-js-textfield mdl-textfield--floating-label calenderField\">\n							<input class=\"mdl-textfield__input\" type=\"text\" name=\"daterange\"/>\n							<label class=\"mdl-textfield__label\" for=\"sample4\">Date range</label>\n						</div>\n					</div>\n					<div class=\"mdl-cell--12-col\">\n						<div class=\"mdl-cell--10-col mdl-textfield mdl-js-textfield mdl-textfield--floating-label emailField\">\n							<input class=\"mdl-textfield__input\" type=\"email\" pattern=\"^\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$\" id=\"sample4\">\n							<label class=\"mdl-textfield__label\" for=\"sample4\">Email</label>\n							<span class=\"mdl-textfield__error\">Invalid Email address</span>\n						</div>\n						<div class=\"mdl-cell--2-col emailAdd hidden\" style=\"display:inline-block;\">\n							<button class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent emailAddBtn\">\n								Add\n							</button>\n						</div>\n					</div>\n\n					<button class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent saveBtn\">\n						Save\n					</button>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "						<div class=\"mdl-cell--12-col mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height dropdown\">\n							<input type=\"text\" value=\"\" class=\"mdl-textfield__input\" id=\"sample5\" readonly>\n							<input type=\"hidden\" value=\"\" name=\"sample5\">\n							<i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i>\n							<label for=\"sample5\" class=\"mdl-textfield__label\">Department</label>\n							<ul for=\"sample5\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},((stack1 = ((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.preferences : stack1)) != null ? stack1.availableDepartments : stack1),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "							</ul>\n						</div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "									<li class=\"mdl-menu__item\" data-val=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\">"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</li>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},((stack1 = ((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.preferences : stack1)) != null ? stack1.users : stack1),{"name":"each","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "						<span class=\"mdl-chip mdl-chip--contact mdl-chip--deletable\">\n							<span class=\"mdl-chip__contact mdl-color--teal mdl-color-text--white\">"
    + ((stack1 = (helpers.substring || (depth0 && depth0.substring) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,0,1,{"name":"substring","hash":{},"data":data})) != null ? stack1 : "")
    + "</span>\n							<span class=\"mdl-chip__text\">"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</span>\n							<a href=\"#\" class=\"mdl-chip__action\"><i class=\"material-icons\">cancel</i></a>\n						</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"mdl-grid demo-content\">\n    <div class=\"demo-charts demo-card-wide mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid\">\n		<div class=\"mdl-cell--8-col\" style=\"margin:auto;\">\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.data : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</div>\n		<div class=\"mdl-cell--4-col\" style=\"margin:auto;\">\n			<div class=\"mdl-cell--12-col chipHolder\">\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = ((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.preferences : stack1)) != null ? stack1.users : stack1),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "			</div>\n		</div>\n    </div>\n</div>";
},"useData":true});

Handlebars.template.analysis = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.results : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.results : stack1),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "                <div class=\"mdl-grid demo-content perDayDataContainer\">\n                    <div class=\"demo-charts demo-card-wide mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid\">\n                        <div class=\"mdl-card__actions\">\n                            <h2 class=\"mdl-card__title-text\">"
    + container.escapeExpression(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"key","hash":{},"data":data}) : helper)))
    + "</h2>    \n                            <div class=\"mdl-card__supporting-text everyoneFilled hidden\">Everyone filled Time Sheet on "
    + container.escapeExpression(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"key","hash":{},"data":data}) : helper)))
    + "</div>                      \n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.users : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                        </div>\n                    </div>\n                </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "                                <ul class=\"demo-list-icon mdl-list\" sheetId=\""
    + container.escapeExpression(((helper = (helper = helpers.sheetId || (depth0 != null ? depth0.sheetId : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"sheetId","hash":{},"data":data}) : helper)))
    + "\" date="
    + container.escapeExpression(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"key","hash":{},"data":data}) : helper)))
    + ">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.users : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                                </ul>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                                        <li class=\"mdl-list__item\" status=\""
    + container.escapeExpression(container.lambda((depth0 != null ? depth0.status : depth0), depth0))
    + "\" tabName=\""
    + container.escapeExpression(container.lambda((depth0 != null ? depth0.tabName : depth0), depth0))
    + "\" dimesion=\""
    + container.escapeExpression(container.lambda((depth0 != null ? depth0.dimension : depth0), depth0))
    + "\">\n                                            <span class=\"mdl-list__item-primary-content\">\n                                                <i class=\"material-icons mdl-list__item-icon\" status=\""
    + container.escapeExpression(container.lambda((depth0 != null ? depth0.status : depth0), depth0))
    + "\">"
    + container.escapeExpression((helpers.statusIcon || (depth0 && depth0.statusIcon) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.status : depth0),{"name":"statusIcon","hash":{},"data":data}))
    + "</i>\n                                                "
    + container.escapeExpression(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"key","hash":{},"data":data}) : helper)))
    + "\n                                            </span>\n                                        </li>   \n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"container\">\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.data : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>";
},"useData":true});

Handlebars.registerHelper('substring', function( string, start, end ) {
    var theString = string.substring( start ,end );
    return new Handlebars.SafeString(theString);
});
Handlebars.registerHelper('statusIcon',function(string) {
	if(string == "filled") {
		return "check_circle_outline";
	}
	else if (string == "partial") {
		return "warning";
	}
	else {
		return "cancel";
	}
});
var thisObj = {
	currentPage : "",
	url : {
		host : "https://192.168.233.73.xip.io:8080",
		indexPage : "/index.html",
		authenticatePage : "/authenticate.html",
		preferencesPage : "/preferences.html",
		analysisPage : "/analysis.html",
        autoAuthenticateCall : "/autoAuthenticate",
		updatePreferencesCall : "/updatePreference",
		refreshDepartmentsCall : "/refreshDepartments",
	},
	templateContent : "",
	isSignedin : false,
	haveValidPreferences : false,
	setClientLog : function(message) {
		//logging implementation
	},
	doNavigate : function(url,message) {
		thisObj.isUnderRedirection = true;
		thisObj.setClientLog(message);
		location.href = url;
	},
	setClassName : function() {
		var path = location.pathname;
		switch(path) {
			case thisObj.url.indexPage : {
				$("body").addClass("indexPage");
				thisObj.currentPage = "index";
				break;
			}
			case thisObj.url.authenticatePage : {
				$("body").addClass("authenticationPage");
				thisObj.currentPage = "authenticate";
				break;
			}
			case thisObj.url.preferencesPage : {
				$("body").addClass("preferencesPage");
				thisObj.currentPage = "preferences";
				break;
			}
			case thisObj.url.analysisPage : {
				$("body").addClass("analysisPage");
				thisObj.currentPage = "analysis";
				break;
			}
			default : {
				thisObj.doNavigate(thisObj.url.host + thisObj.url.indexPage,{});
				$("body").addClass("indexPage");
				thisObj.currentPage = "index";
				break;
			}
		}
	},
	makeAJAX : function(config) {
		thisObj.setClientLog({});
		if(config.url != undefined) {
			config.type = config.type != undefined ? config.type : "POST";
			//config.async = config.async != undefined ? config.async : false;
			$.ajax(config);
		}
		else {
			thisObj.setClientLog();
			config.complete({});
		}
	},
	renderHandlebar : function(templateName,templateData,templateOptions) {
		if(templateData && templateName) {
			templateOptions = templateOptions ? templateOptions : "";
			var template = Handlebars.template[templateName];
			if(typeof template == "function") {
				thisObj.templateContent = template(templateData,templateOptions);
				$("main.mdl-layout__content").html(thisObj.templateContent);
			}
			componentHandler.upgradeAllRegistered();
		}
		else {
			thisObj.setClientLog();
		}
		
	},
	setCookie : function(cookieName,cookieData) {
		if(cookieName) {
			var options = {
				expires: 30,
				path: "/"
			};
			$.cookie(cookieName,cookieData,options);
			localStorage.setItem(cookieName, cookieData);
		}
		else {
			thisObj.setClientLog();
		}
	},
	getCookie : function(cookieName) {
		if(cookieName) {
			var cookieData = "";
			if($.cookie(cookieName)) {
				cookieData = $.cookie(cookieName);
			}
			else {
				cookieData = localStorage.getItem(cookieName);
			}
			return cookieData;
		}
		else {
			return undefined;
		}
	},
	showDialog : function (options) {
		options = $.extend({
			id: 'orrsDiag',
			title: null,
			text: null,
			negative: false,
			positive: false,
			cancelable: true,
			contentStyle: null,
			onLoaded: false
		}, options);
	
		// remove existing dialogs
		$('.dialog-container').remove();
		$(document).unbind("keyup.dialog");
	
		$('<div id="' + options.id + '" class="dialog-container"><div class="mdl-card mdl-shadow--16dp"></div></div>').appendTo("body");
		var dialog = $('#orrsDiag');
		var content = dialog.find('.mdl-card');
		if (options.contentStyle != null) content.css(options.contentStyle);
		if (options.title != null) {
			$('<h5>' + options.title + '</h5>').appendTo(content);
		}
		if (options.text != null) {
			$('<p>' + options.text + '</p>').appendTo(content);
		}
		if (options.negative || options.positive) {
			var buttonBar = $('<div class="mdl-card__actions dialog-button-bar"></div>');
			if (options.negative) {
				options.negative = $.extend({
					id: 'negative',
					title: 'Cancel',
					onClick: function () {
						return false;
					}
				}, options.negative);
				var negButton = $('<button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="' + options.negative.id + '">' + options.negative.title + '</button>');
				negButton.click(function (e) {
					e.preventDefault();
					if (!options.negative.onClick(e))
						thisObj.hideDialog(dialog)
				});
				negButton.appendTo(buttonBar);
			}
			if (options.positive) {
				options.positive = $.extend({
					id: 'positive',
					title: 'OK',
					onClick: function () {
						return false;
					}
				}, options.positive);
				var posButton = $('<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="' + options.positive.id + '">' + options.positive.title + '</button>');
				posButton.click(function (e) {
					e.preventDefault();
					if (!options.positive.onClick(e))
						thisObj.hideDialog(dialog)
				});
				posButton.appendTo(buttonBar);
			}
			buttonBar.appendTo(content);
		}
		componentHandler.upgradeDom();
		if (options.cancelable) {
			dialog.click(function () {
				thisObj.hideDialog(dialog);
			});
			$(document).bind("keyup.dialog", function (e) {
				if (e.which == 27)
					thisObj.hideDialog(dialog);
			});
			content.click(function (e) {
				e.stopPropagation();
			});
		}
		setTimeout(function () {
			dialog.css({opacity: 1});
			if (options.onLoaded)
				options.onLoaded();
		}, 1);
	},
	hideDialog : function (dialog) {
		$(document).unbind("keyup.dialog");
		dialog.css({opacity: 0});
		setTimeout(function () {
			dialog.remove();
		}, 400);
	},
	doSignout : function (event) {
		thisObj.setCookie("ID","");
		thisObj.doNavigate(thisObj.url.indexPage,{});
	},
	events : function () {
		$("body").on("click",".signoutBtn",function(e) {
			e.preventDefault();
			var options = {
				title: 'Action',
				text: 'Your account will be signed out. Your preferences will be saved. Do you want to continue?',
				negative: {
					title: 'No'
				},
				positive: {
					title: 'Yes',
					onClick: function (e) {
						thisObj.doSignout(e);
					}
				}
			};
			thisObj.showDialog(options);
		});
		$("body").on("click",".mdl-chip__action i",function(){
			$(this).closest(".mdl-chip--contact").remove();
		});
		$("body").on("keyup",".emailField input",function(e) {
			var email = $(this).val();
			var emailRegex = new RegExp("^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+\.+([a-zA-Z0-9]{2,4})+$");
			if(email && emailRegex.test(email)) {
				$(".emailAdd").addClass("display-inline").removeClass("hidden");
			}
			else {
				$(".emailAdd").removeClass("display-inline").addClass("hidden");
			}
		});	
		$("body").on("click",".emailAdd .emailAddBtn",function(e) {
			var email = $(".emailField input");
			var chip = '<span class="mdl-chip mdl-chip--contact mdl-chip--deletable"><span class="mdl-chip__contact mdl-color--teal mdl-color-text--white">'+$(email).val()[0]+'</span><span class="mdl-chip__text">'+$(email).val()+'</span><a href="#" class="mdl-chip__action"><i class="material-icons">cancel</i></a></span>';
			$(".chipHolder").append(chip);			
			$(email).val("").trigger("keyup");
			$(".emailField, .emailAdd .emailAddBtn").removeClass('is-dirty');			
		});
		$("body").on("click",".saveBtn",function() {
			var department = $(".dropdown input:first-child").val();
			var selectedDates = $('.calenderField input').val();
			var dateArr = selectedDates.split(" - ");
			var startDate = "";
			var endDate = "";
			if(dateArr && dateArr[0] == dateArr[1]) {
				startDate = moment(dateArr[0],"DD/MM/YYYY").format("MM_DD_YYYY");
				endDate = startDate;
			}
			else {
				startDate = moment(dateArr[0],"DD/MM/YYYY").format("MM_DD_YYYY");
				endDate = moment(dateArr[1],"DD/MM/YYYY").format("MM_DD_YYYY");
			}
			var usersDom = $(".chipHolder .mdl-chip__text");
			var users = [];
			usersDom.each(function(){
				var email = $(this).text();
				var emailRegex = new RegExp("^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+\.+([a-zA-Z0-9]{2,4})+$");
				if(email && emailRegex.test(email)) {
					users.push(email);
				}
			});
			var preferences = {
				users : users,
				startDate : startDate,
				endDate : endDate,
				department : department
			}
			if(preferences.startDate && preferences.endDate && preferences.department) {
				thisObj.updatePreferences(preferences);
			}
			else {
				
			}
		});
		$("body").on("click",".toggleCompliant", function() {
			if($("body").hasClass("compliantsHidden")) {
				$("body").removeClass("compliantsHidden");
				$(this).text("Hide Compliants");
			}
			else {
				$("body").addClass("compliantsHidden");
				$(this).text("Show Compliants");
			}			
		});
		$("body").on("click",".toggleWeekend", function() {
			if($("body").hasClass("weekEndsHidden")) {
				$("body").removeClass("weekEndsHidden");
				$(this).text("Hide Weekends");
			}
			else {
				$("body").addClass("weekEndsHidden");
				$(this).text("Show Weekends");
			}	
		});
	},
	preferencesCustomEvents : function (response) {
		if(response.data && response.data.preferences) {
			getmdlSelect.init(".getmdl-select");
			if(response.data.preferences.department) {
				thisObj.response = response;
				setTimeout(function() {
					$('.getmdl-select ul li[data-val="'+thisObj.response.data.preferences.department+'"]').trigger("click");
				},1000);
			}
			var options = {
				"autoApply": true,
				"dateLimit": {
					"days": 14
				},
				"locale": {
					"format": "DD/MM/YYYY",
					"separator": " - ",
					"applyLabel": "Apply",
					"cancelLabel": "Cancel",
					"fromLabel": "From",
					"toLabel": "To",
					"customRangeLabel": "Custom",
					"weekLabel": "W",
					"daysOfWeek": [
						"Su",
						"Mo",
						"Tu",
						"We",
						"Th",
						"Fr",
						"Sa"
					],
					"monthNames": [
						"January",
						"February",
						"March",
						"April",
						"May",
						"June",
						"July",
						"August",
						"September",
						"October",
						"November",
						"December"
					],
					"firstDay": 1
				},
				"showCustomRangeLabel": false,
				"opens": "right"
			};
			if(response.data.preferences.startDate) {
				var startDate = moment(response.data.preferences.startDate,"MM_DD_YYYY").format("DD/MM/YYYY");
				options.startDate = startDate;				
			}
			if(response.data.preferences.endDate) {
				var endDate = moment(response.data.preferences.endDate,"MM_DD_YYYY").format("DD/MM/YYYY");
				options.endDate = endDate;
			}
			if(response.data.preferences.minDate) {
				var minDate = moment(response.data.preferences.minDate,"MM_DD_YYYY").format("DD/MM/YYYY");
				options.minDate = minDate;
			}
			if(response.data.preferences.maxDate) {
				var maxDate = moment(response.data.preferences.maxDate,"MM_DD_YYYY").format("DD/MM/YYYY");
				options.maxDate = maxDate;
			}
			$('input[name="daterange"]').daterangepicker(options, function(start, end, label) {
			  console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')');
			  $(".calenderField").addClass("is-dirty");
			});
			$(".calenderField").addClass("is-dirty");
		}
	},
	showLoading : function() {
		$("body .mask").addClass('display').removeClass("hidden");
		$("body .spinner").addClass("display").removeClass("hidden");
	},
	hideLoading : function() {
		setTimeout(function(){
			$("body .mask").addClass("hidden").removeClass('display');
			$("body .spinner").removeClass("display").addClass("hidden");
		},400);
	},
	refreshElememts : function(response) {
		if(response && response.authentication && response.authentication.ID) {
			if(response.authentication.picture) {
				$(".demo-drawer-header img.demo-avatar").attr("src",response.authentication.picture);
			}
			if(response.authentication.name) {
				$(".demo-drawer-header .mailContent").text(response.authentication.name);
			}
		}
		thisObj.hideLoading();
	},
	showMenus : function(response) {
		if(response && response.authentication && response.authentication.ID) {
			thisObj.isSignedin = true;
		}
		if(response && response.data && response.data.preferences && response.data.preferences.users && response.data.preferences.users.length && response.data.preferences.department && response.data.preferences.startDate && response.data.preferences.endDate) {
			thisObj.haveValidPreferences = true;
		}
		if(thisObj.isSignedin) {
			$(".preferencesBtn,.signoutBtn").removeClass("hidden");
		}
		if(thisObj.haveValidPreferences) {
			$(".analysisBtn").removeClass("hidden");
		}
	},
	showToast : function(toastData) {
		var snackbarContainer = document.querySelector('#demo-toast-example');
		toastData = toastData ? toastData : "";
		var data = {
			message: toastData
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(data);
	},
	sortResults : function(response) {
		var results = response && response.data && response.data.results ? response.data.results : "";
		if(results != "") {
			var dateArray = Object.keys(results);
			dateArray.sort();
			var sortedResults = {};
			for(i =0; i < dateArray.length; i++){
				sortedResults[dateArray[i]] = results[dateArray[i]];
			}
			response.data.results = sortedResults;			
		}
		else {
			thisObj.setClientLog("Data missing in response");
		}
		return response;
	},
	doAnalysisFormat : function() {
		if($("body").hasClass("analysisPage")) {
			$(".perDayDataContainer").each(function(){
				var isCompliant = true;
				$("ul li", this).each(function() {
					var status = $(this).attr("status");
					if(status == "empty" || status == "partial") {
						isCompliant = false;
						return;
					}
				});
				if(isCompliant) {
					$(this).addClass("compliant");
				}
				else {
					$(this).addClass("nonCompliant");
				}
				var dateText = $(".mdl-card__title-text",this).text();
				var date = dateText ? moment(dateText, "MM_DD_YYYY") : "";
				if(date != "") {
					if(date.format("dddd") == "Saturday" || date.format("dddd") == "Sunday") {
						$(this).addClass("weekEndDay");
					}
					else {
						$(this).addClass("weekDay");
					}
				}
				else {
					thisObj.setClientLog("Date missing");
				}
			});
		}
	},
	autoAuthenticate : function() {
		var ID = thisObj.getCookie("ID");
		var params={};
		window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
			params[key] = value;
		});
		var locationData = {
			path : location.pathname
		}
		var config = {};
		config.url = thisObj.url.host + thisObj.url.autoAuthenticateCall;
		config.type = "POST";
		config.async = false;
		//var authCode = params.code ? params.code : "accessDenied";
		config.data = {
			"ID" : ID,
			"location" : locationData,
			"requestParams" : params
		};
		config.complete = function(response) {
			response = response.responseJSON;
			console.log(response);
			analysisResponse = response;
			if(response && response.message) {
				thisObj.showToast(response.message);
			}
			if(response && response.authentication && response.authentication.status) {
				thisObj.setCookie("ID",response.authentication.ID);
				
				if(response.data && response.data.redirectURL) {
					thisObj.doNavigate(response.data.redirectURL,{});
				}
				else {				
					switch(thisObj.currentPage) {
						case "index" : {
							thisObj.renderHandlebar("index",response);
							break;
						}
						case "authenticate" : {
							thisObj.renderHandlebar("authenticate",response);
							break;
						}
						case "preferences" : {
							thisObj.renderHandlebar("preferences",response);
							thisObj.preferencesCustomEvents(response);
							break;
						}
						case "analysis" : {
							var sortedResponse = thisObj.sortResults(response);
							thisObj.renderHandlebar("analysis",sortedResponse);
							thisObj.doAnalysisFormat();
							break;
						}
						default : {
							thisObj.setClientLog("");
							thisObj.doNavigate(thisObj.url.indexPage,{});
						}
					}
					thisObj.refreshElememts(response);
					thisObj.showMenus(response);
					thisObj.events();
				}
			}
			else {
				thisObj.setCookie("ID","");
				thisObj.renderHandlebar("","");
				thisObj.doNavigate(thisObj.url.indexPage,{});
			}
		}
		thisObj.makeAJAX(config);
	},
	updatePreferences : function(preferences) {
		var ID = thisObj.getCookie("ID");
		var locationData = {
			path : location.pathname
		}
		var config = {};
		config.url = thisObj.url.host + thisObj.url.updatePreferencesCall;
		config.type = "POST";
		// config.async = false;
		config.data = {
			"ID" : ID,
			"location" : locationData,
			"preferences" : preferences
		};
		config.complete = function(response) {
			response = response ? response.responseJSON : {};
			if(response && response.message) {
				thisObj.showToast(response.message);
			}
			if(response.data && response.data.redirectURL) {
				thisObj.doNavigate(response.data.redirectURL,{});
			}
			else {
				thisObj.renderHandlebar("index",response);
			}
			thisObj.showMenus(response);
			thisObj.hideLoading();
		}
		thisObj.showLoading();
		thisObj.makeAJAX(config);		
	}
}
$(document).ready(function(){
	console.log("Document Loaded");
	if(location.origin == thisObj.url.host) {
		thisObj.setClassName();
		if(!thisObj.isUnderRedirection) {
			thisObj.autoAuthenticate();
		}		
	}
	else {
		thisObj.doNavigate(thisObj.url.host + thisObj.url.indexPage,{});
	}
});