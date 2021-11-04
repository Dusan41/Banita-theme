$(document).ready(function () {
	function sidebarH() {
		$('#sidebar').affix({
			offset: {
				top: 0
			}
		}).css({
			'max-height': $(window).height() - $('.page-footer').outerHeight() - $('.page-header').outerHeight() - 80
		})
	}

	function getRelatedContent(el) {
		return $($(el).attr('href'));
	}

	function getRelatedNavigation(el) {
		var cur_id = '#' + $(el).attr('id');
		history.pushState({}, '', cur_id);
		return $('nav a[href=' + cur_id + ']');
	}
	$('nav a').on('click', function (e) {
		var $this = $(this);
		//e.preventDefault();
		$('body').data('stopscroll', true);
		$('html,body').animate({
			scrollTop: getRelatedContent(this).offset().top - 120
		}, function () {
			$('body').removeData('stopscroll');
		});
		$('nav a').removeClass('active');
		$this.addClass('active');
		$parent = $this.parent().parent().parent('li').children('a');
		$parent.addClass('active');
		$pparent = $parent.parent().parent().parent('li');
		$ppparent = $pparent.parent().parent().parent('li');
		if ($pparent.length) $pparent.children('a').addClass('active');
		if ($ppparent.length) $ppparent.children('a').addClass('active');
	});
	$('.nav-link').on('click', function (e) {
		var $this = $(this);
		e.preventDefault();
		$('body').data('stopscroll', true);
		$('html,body').animate({
			scrollTop: getRelatedContent(this).offset().top - 120
		}, function () {
			$('body').removeData('stopscroll');
		});
	});
	var $collapsed = $('.collapsed'),
		slidespeed = 250;
	$('.submenu', $collapsed).each(function () {
		if ($(this).closest('li').is('.opened')) {
			$(this).slideDown(0);
		}
	});

	function toggleClose(toggle) {
		var $this = $(toggle),
			$thiscontent = $this.next('.submenu');
		$this.html('+');
		$thiscontent.slideUp(slidespeed);
		$this.parent().removeClass('opened');
	}

	function toggleOpen(toggle) {
		var $this = $(toggle),
			$thiscontent = $this.next('.submenu');
		$this.html('–');
		$thiscontent.slideDown(slidespeed);
		$this.parent().addClass('opened');
	}
	var $accordion = $('#accordion');
	$('.panel-title a', $accordion).on('click', function (el) {
		$this = $(this);
		var cur_faq = $this.attr('href');
		history.pushState({}, '', cur_faq);
	})
	$('.toggle', $collapsed).on('click', function (e) {
		e.preventDefault;
		var $this = $(this);
		if ($this.parent().is('.opened')) {
			toggleClose($this);
			$this.removeClass('custom-open');
		} else {
			toggleOpen($this);
			$this.addClass('custom-open');
		}
	})
	$('.popup').magnificPopup({
		type: 'image'
	})

	sidebarH();
	$(window).on('resize', function () {
		sidebarH();
	});

	var $sections = $('section,article');
	var startScroll = false;
	$(window).on('scroll', function () {
		if (startScroll) {
			console.log('scroll')
			var currentScroll = $(this).scrollTop();
			var $currentSection,
				topStart = 120;
			$sections.each(function () {
				if (!$('body').data('stopscroll')) {
					var divPosition = $(this).offset().top - topStart,
						divHeight = $(this).outerHeight();
					if (divPosition - 1 < currentScroll && (divPosition + divHeight) > currentScroll) {
						$currentSection = $(this);
						var cur_id = '#' + $currentSection.attr('id'),
							$currentNav = $('nav a[href=' + cur_id + ']'),
							$liparent = $currentNav.parent().parent().parent('li');
						if ($liparent.length) {
							var $parent = $liparent.children('a');
							var $parentNav = $parent.parent('li');
						}
						if ($liparent.length > 0) {
							$('nav a').removeClass('active');
							toggleOpen($parent.addClass('auto-open').next('.toggle'));
							$('a', $parentNav).removeClass('active');
							history.pushState({}, '', cur_id);
							$currentNav.addClass('active');
							$parent.addClass('active');
							$pparent = $parent.parent().parent().parent('li');
							$ppparent = $pparent.parent().parent().parent('li');
							if ($pparent.length) $pparent.children('a').addClass('active');
							if ($ppparent.length) $ppparent.children('a').addClass('active');
						} else {
							$('nav a').removeClass('active');
							toggleClose($('a').next('.toggle'));
							history.pushState({}, '', cur_id);
							$currentNav.addClass('active');
						}
					}
				}
			})

		}
	});
	$(window).load(function () {
		var anchor = location.hash.replace('#', '');
		setTimeout(function () {
			if (anchor != '') {
				if (anchor.match('faq')) {
					var $openPanel = $('#' + anchor);
					$openPanel.addClass('in');
					var $panelHeading = $openPanel.prev();
					$panelHeading.find(".panel-title a").removeClass('collapsed');
					$('html,body').animate({
						scrollTop: $openPanel.offset().top - 160
					}, function () {
						startScroll = true;
						$(window).scroll();
					})
				} else {
					var $anchor = $('#' + anchor);
					$('html,body').animate({
						scrollTop: $anchor.offset().top - 120
					}, function () {
						startScroll = true;
						$(window).scroll();
					})
				}
			} else {
				startScroll = true;
				$(window).scroll();
			}
		}, 300);
	});
});