    $.fn.toolsPanel = function() {
        var panel = $(this),
            button = $(".tools-btn", panel),
            blocktools = $(".block-tools", panel),
            layoutmodeall = $("input[name='layoutmodeall']"),
            layoutmodeblock = $("input[name='layoutmodeblock']"),
            slidepanelshow = $("input[name='slidepanelshow']"),
			rounded = $("input[name='rounded']"),
			rtlmode = $("input[name='rtlmode']"),
			sticky = $("input[name='sticky']"),
			menuanimation = $("input[name='menuanimation']"),
			blackout = $("input[name='blackout']"),
            wrapper = $("body"),
			header = $(".page-header"),
			menu = $(".megamenu", header),
            block = $(".block"),
			productpreview = $(".productpreview"),
			productpreviewradio = $("input[name='productpreview']");

        // set current settings
		if ($('body').hasClass('rounded')) {
			rounded.prop("checked", true);
		}
		else {
			rounded.prop("checked", false);
		}
		
		if (header.hasClass('sticky')) {
			sticky.prop("checked", true);
		}
		else {
			sticky.prop("checked", false);
		}	
		
		if (menu.hasClass('blackout')) {
			blackout.prop("checked", true);
		}
		else {
			blackout.prop("checked", false);
		}		
		
		productpreview.hide();
		
		if (menu.hasClass('fadein')) {
            panel.find($("input[value='fade']")).prop("checked", true);
            panel.find($("input[value='slide']")).prop("checked", false);
			panel.find($("input[value='none']")).prop("checked", false);
		}
		else if (menu.hasClass('slidetop')) {
            panel.find($("input[value='fade']")).prop("checked", false);
            panel.find($("input[value='slide']")).prop("checked", true);
			panel.find($("input[value='none']")).prop("checked", false);
		}
		else {
            panel.find($("input[value='fade']")).prop("checked", false);
            panel.find($("input[value='slide']")).prop("checked", false);
			panel.find($("input[value='none']")).prop("checked", true);
		}
		
		
		if ($('body').hasClass('open-panel')) {
			slidepanelshow.prop("checked", true);
		}
		else {
			slidepanelshow.prop("checked", false);
		}		
		
		if ($('body').hasClass('rtl')) {
			rtlmode.prop("checked", true);
		}
		else {
			rtlmode.prop("checked", false);
		}
		
        if ($('body').hasClass('fullwidth')) {
            panel.find($("input[value='fullwidth']")).prop("checked", true);
            panel.find($("input[value='boxed']")).prop("checked", false);
        } else {
            panel.find($("input[value='fullwidth']")).prop("checked", false);
            panel.find($("input[value='boxed']")).prop("checked", true);
        }

        button.on('click', function(e) {
            e.preventDefault();
            panel.toggleClass("open");
            $('body').toggleClass("edit-mode");
        });
			
		$('.block, .page-header, .page-footer').on("mouseenter", function() {
            if ($('body').hasClass('edit-mode')) {
                var toolscurrent = blocktools.detach();
                $(this).prepend(toolscurrent);
				if (!$(this).hasClass('all-previews') && $(this).find('.product-variant-2').length){
					$(this).addClass('all-previews');	
				}
                if ($(this).find('.product-variant-1').length) {
					productpreview.show();
					$(this).find($("input[value='previewsmall']")).prop("checked", true);					
				} else if ($(this).find('.product-variant-3').length) {
					productpreview.show();
					$(this).find($("input[value='previewbig']")).prop("checked", true);
				} else if ($(this).find('.product-variant-2').length) {
					$(this).find($("input[value='previewsmall2']")).prop("checked", true);
					productpreview.show();
				} else productpreview.hide();
				if ($(this).hasClass('fullwidth')) {
                    $(this).find($("input[value='fullwidth']")).prop("checked", true);
                    $(this).find($("input[value='boxed']")).prop("checked", false);
                    $(this).find($("input[value='fullboxed']")).prop("checked", false);
                } else if ($(this).hasClass('boxed')) {
                    $(this).find($("input[value='fullwidth']")).prop("checked", false);
                    $(this).find($("input[value='boxed']")).prop("checked", true);
                    $(this).find($("input[value='fullboxed']")).prop("checked", false);
                } else if ($(this).hasClass('fullboxed')) {
                    $(this).find($("input[value='fullwidth']")).prop("checked", false);
                    $(this).find($("input[value='boxed']")).prop("checked", false);
                    $(this).find($("input[value='fullboxed']")).prop("checked", true);
                } else {
					if($('body').hasClass('boxed')){
						$(this).find($("input[value='fullwidth']")).prop("checked", false);
						$(this).find($("input[value='boxed']")).prop("checked", true);
						$(this).find($("input[value='fullboxed']")).prop("checked", false);
					} else if($('body').hasClass('fullwidth')){
						$(this).find($("input[value='fullwidth']")).prop("checked", true);
						$(this).find($("input[value='boxed']")).prop("checked", false);
						$(this).find($("input[value='fullboxed']")).prop("checked", false);						
					}
                }
            }
        });

        $('.block, .page-header, .page-footer').on("mouseleave", function() {
            if ($('body').hasClass('edit-mode')) {
                var toolscurrent = $(".block-tools", $(this)).detach();
                $(".block-tools", panel).prepend(toolscurrent);
            }
        });
        slidepanelshow.on('change', function() {
            wrapper.toggleClass("open-panel");
			$('body').otherResize();		
        })
		rounded.on('change', function() {
            wrapper.toggleClass("rounded");
        })		
		rtlmode.on('change', function() {
            $('body').toggleClass("rtl");
			$('body').otherResize();
        })
        layoutmodeall.on('change', function() {
			var wWidth = wrapper.width() - $('.sidebar-wrapper').width();
            switch ($(this).val()) {
                case 'fullwidth':
                    $('body').removeClass('boxed').addClass('fullwidth');
					$('.block, .page-header, .page-footer').css({
                        'width': '',
                        'margin-left': '',
						'margin-right': ''
                    }).removeClass('boxed fullboxed fullwidth');
					$('body').otherResize();
					break;
                case 'boxed':
                    $('body').removeClass('fullwidth').addClass('boxed');
                    $('.block, .page-header, .page-footer').css({
                        'width': '',
                        'margin-left': '',
						'margin-right': ''
                    }).removeClass('boxed fullboxed fullwidth');
					$('body').otherResize();
                    break;
            }
        });
			
        productpreviewradio.on('change', function() {  
            var $thisblock = $(this).closest('.block');
            switch ($(this).val()) {
                case 'previewsmall':
                    $thisblock.find('.products-grid').removeClass('product-variant-3 product-variant-2').addClass('product-variant-1');
						        $thisblock.find('.slick-initialized').slick('setPosition');	
                    break;
                case 'previewbig':
                    $(this).closest('.block').find('.products-grid').removeClass('product-variant-1 product-variant-2').addClass('product-variant-3');
						        $thisblock.find('.slick-initialized').slick('setPosition');						
                    break;               
				        case 'previewsmall2':
                    $(this).closest('.block').find('.products-grid').removeClass('product-variant-1 product-variant-3').addClass('product-variant-2');
						        $thisblock.find('.slick-initialized').slick('setPosition');					
                    break;
            }
        });
		
		layoutmodeblock.on('change', function() {
            switch ($(this).val()) {
                case 'fullwidth':
                    $(this).closest('.block, .page-header, .page-footer').removeClass('boxed fullboxed').addClass('fullwidth');
					$('body').otherResize();				
                    break;
                case 'fullboxed':
                    $(this).closest('.block, .page-header, .page-footer').removeClass('boxed fullwidth').addClass('fullboxed');
					$('body').otherResize();
					break;
                case 'boxed':
                    $(this).closest('.block, .page-header, .page-footer').removeClass('fullwidth fullboxed').addClass('boxed');
 					$('body').otherResize();
					break;
            }
        });
		
		sticky.on('change', function() {
			if (header.hasClass("sticky")){
				header.removeClass("sticky st-visible is-sticky").addClass('no-sticky');
			} else {
				header.removeClass("no-sticky").addClass('sticky');
			}
        })
		blackout.on('change', function() {
            menu.toggleClass("blackout");
        })
		menuanimation.on('change', function() {
            switch ($(this).val()) {
                case 'none':
					menu.removeClass("fadein slidetop");
                    break;
                case 'fade':
					menu.removeClass("slidetop").addClass("fadein");
                    break;                
				case 'slide':
					menu.removeClass("fadein").addClass("slidetop");
                    break;
            }
        });
		
		 $.fn.removePrefixedClasses = function (prefix) {
            var classNames = $(this).attr('class').split(' '),
                className,
                newClassNames = [],
                i;
            for(i = 0; i < classNames.length; i++) {
                className = classNames[i];
                if(className.indexOf(prefix) !== 0) {
                    newClassNames.push(className);
                    continue;
                }
            }
            $(this).attr('class', newClassNames.join(' '));
        };
		
		$('.color-list li a', panel).on('click', function(e){
			var $this = $(this);
			$('.color-list li').removeClass('active');
			$this.parent().addClass('active');
			$('body').removePrefixedClasses('color-');
			$('body').addClass($this.attr('data-color'));
			e.preventDefault();
		})
		
    }