/* !
ARIA Tabs Module R1.0
Copyright 2010-2013 Bryan Garaventa (WhatSock.com)
Part of AccDC, a Cross-Browser JavaScript accessibility API, distributed under the terms of the Open Source Initiative OSI - MIT License
*/

(function(){

	$A.setTabs = function(selector, overrides, useARIA, context, callback){
		var tabIds = [], wheel = [], autoStartId = '', context = context || document,
			tabs = $A.query(selector, context, function(i, o){
			var id = o.id || $A.genId(), ovrs = {}, isInternal = $A.getAttr(o, 'data-internal');
			ovrs.id = id;
			ovrs.role = $A.getAttr(o, 'data-role') || 'Tab';
			ovrs.autoStart = $A.getAttr(o, 'data-defaultopen') ? true : false;

			if (ovrs.autoStart)
				autoStartId = i;
			ovrs.trigger = o;
			ovrs.mode = typeof overrides.mode === 'number' ? overrides.mode : (overrides.preload ? 0 : 1);
			ovrs.source = isInternal ? (function(){
				var g = $A.getEl(isInternal);

				if (g)
					return g.parentNode.removeChild(g);

				else
					return null;
			})() : (function(){
				var d = $A.createEl('div'), s = $A.getAttr(o, 'data-src');
				s = s.replace('#', ' #');

				if (overrides.preload){
					$A.load(d, s, function(){
						if (overrides.preloadImages){
							if (!$A.getEl(imgLoaderId)){
								document.body.appendChild($A.createEl('div',
												{
												id: imgLoaderId
												}, $A.sraCSS));
							}

							overrides.imgLoader = $A.getEl(imgLoaderId);
							$A.query('img', d, function(i, o){
								if (o.src && $A.query('img[src="' + o.src + '"]', overrides.imgLoader).length < 1){
									overrides.imgLoader.appendChild($A.createEl('img',
													{
													src: o.src,
													alt: ''
													}));
								}
							});
						}
					});

					return d;
				}

				else
					return s;
			})();
			ovrs.isStatic = '#' + $A.getAttr(o, 'data-insert');
			ovrs.showHiddenClose = overrides.showHiddenClose || false;
			ovrs.bind = 'click';
			ovrs.ariaLevel = $A.getAttr(o, 'data-headinglvl') || overrides.ariaLevel || 3;
			ovrs.isTab = useARIA ? false : true;
			ovrs.tabRole = useARIA ? '' : (overrides.tabRole || 'Tab');
			ovrs.tabState = useARIA ? '' : (overrides.tabState || 'Selected');
			ovrs.toggleClass = overrides.toggleClass || 'active';
			ovrs.runAfter = function(dc){
				$A.query(selector, context, function(j, p){
					$A.remClass(p, dc.toggleClass);

					if (useARIA)
						$A.setAttr(p,
										{
										'aria-expanded': p == dc.triggerObj ? 'true' : 'false',
										'aria-selected': p == dc.triggerObj ? 'true' : 'false'
										});
				});

				$A.addClass(dc.triggerObj, dc.toggleClass);

				if (callback && typeof callback === 'function')
					callback.apply(dc.triggerObj, [dc]);
			};
			ovrs.runAfterClose = function(dc){
				$A.query(selector, context, function(j, p){
					$A.remClass(p, dc.toggleClass);

					if (useARIA)
						$A.setAttr(p,
										{
										'aria-expanded': 'false'
										});
				});
			};

			wheel.push(ovrs);
			tabIds.push(id);
		});

		if (useARIA)
			createARIATabs(selector, context, autoStartId);

		else
			checkTabs(selector, context);
		$A(wheel, overrides);
		return tabIds;
	};

	var createARIATabs = function(selector, context, start){
		var cur = null, index = start || 0, setFocus = function(s){
			var i = $A.inArray(this, tabs);

			if (i !== -1)
				index = i;

			if (cur){
				$A.setAttr(cur,
								{
								tabindex: '-1',
								'aria-selected': 'false'
								});
			}

			cur = this;
			$A.setAttr(cur,
							{
							tabindex: '0',
							'aria-selected': 'true'
							});

			if (!s)
				cur.focus();
		}, tabs = $A.query(selector, context, function(){
			$A.setAttr(this,
							{
							tabindex: '-1',
							'aria-expanded': 'false',
							'aria-selected': 'false',
							'aria-label': $A.getText(this)
							});

			$A.bind(this,
							{
							click: function(ev){
								setFocus.apply(this, [true]);
								ev.preventDefault();
							},
							keydown: function(ev){
								var k = ev.which || ev.keyCode;

								// 37 left, 38 up, 39 right, 40 down
								if (k >= 37 && k <= 40){
									if (k == 37 || k == 38)
										index = index === 0 ? tabs.length - 1 : index - 1;

									else if (k == 39 || k == 40)
										index = index === tabs.length - 1 ? 0 : index + 1;

									setFocus.apply(tabs[index]);
									ev.preventDefault();
								}

								else if (k == 13 || k == 32){
									$A.trigger(tabs[index], 'click');
									ev.preventDefault();
								}
							}
							});
		});

		if (tabs.length){
			cur = tabs[0];
			$A.setAttr(cur, 'tabindex', 0);
		}
	}, checkTabs = function(selector, context){
		$A.query(selector, context, function(i, o){
			var tn = o.nodeName.toLowerCase();

			if (tn != 'a' && tn != 'button'){
				$A.setAttr(o,
								{
								role: 'link',
								tabindex: '0'
								});

				$A.bind(o, 'keydown', function(ev){
					var k = ev.which || ev.keyCode;

					if (k == 13){
						$A.trigger(o, 'click');
						ev.preventDefault();
					}
				});
			}
		});
	}, imgLoaderId = 'i' + $A.genId();
})();