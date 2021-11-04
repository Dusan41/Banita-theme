function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i){
        indexed_array[n['name'].split('properties[').join('').split(']').join('')] = n['value'];
    });
    return indexed_array;
}
/*---------------------MODAL CHECKOUT-----------------------------*/
function showCheckoutModal()
{
    $('#modalCheckout').data('cart',JSON.stringify(CartJS));
    if (($("#quickView").data('bs.modal') || {}).isShown) {
        $('#quickView').modal('hide');
    }
    $('#modalCheckout').modal('show');
}

function checkoutModalPriceUpdate(price)
{
    $price_format=price_format;
    return Shopify.formatMoney(price, $price_format);
}

function modalCheckoutUpdate(){
    $price_format=price_format;
    if($('#modalCheckout').length && $('body').hasClass('checkout-popup')){
        $('.js-mdlchk-prd-count').text(CartJS.cart.item_count);
        $('.js-mdlchk-prd-total').html(Shopify.formatMoney(CartJS.cart.total_price, $price_format));
        renderPluralSingle('>1,0');
        $('.mdlchk-total').removeClass('block-loading');
    }
}

function modalCheckoutPreAjax(){
    $('.mdlchk-total').addClass('block-loading');
}

function checkoutModalQtyUpdate(qty, id) {
    modalCheckoutPreAjax();
    CartJS.updateItemById(id, qty,{},{
        "success": function(data, textStatus, jqXHR) {
            $('#modalCheckout').data('cart',JSON.stringify(CartJS));
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            modalCheckoutPostAjax();
            $('#modalError .modal-body p').text(errorThrown);
            $('#modalError').modal('show');
        }
    });
}

function getJsonShopifyOfShopifyProduct(handle){
    jQuery.getJSON('/products/'+handle+'.js', function(product) {
        console.log(product);
    });
}


function checkoutModalGetUpsells(handle, callback)
{
    var upsells = [],
        products_array = [];
    $.getJSON('/products/'+handle+'.js', function(product) {
        if(product.tags != undefined)
        {
            $.each(product.tags, function(index, item) {
                if(item.indexOf('upsell:') !== -1)
                {
                    upsells.push(item.split('upsell:')[1]);
                }
            })
        }
    })
        .done(function() {
            Promise.all(upsells.map(function (tag) {
                return new Promise(function (resolve, reject) {
                    jQuery.getJSON('/products/'+tag+'.js', function(product) {
                        products_array[tag] = product;
                    })
                        .done(function (data) {
                            switch (true) {
                                case data.available && typeof data.tags.find(function (item) {
                                    return item === 'pre-order';
                                }) === 'undefined':
                                    data.status = 'add_to_cart';
                                    break;
                                case data.available && typeof data.tags.find(function (item) {
                                    return item === 'pre-order';
                                }) !== 'undefined':
                                    data.status = 'pre_order';
                                    break;
                                case data.available && data.options.length > 1:
                                    data.status = 'select_options';
                                    break;
                                case !data.available:
                                    data.status = 'sold_out';
                                    break;
                            }
                            resolve(data)
                        })
                        .fail(function (data) {
                            reject(data);
                        });
                })
            })).then(function (data) {
                if(data.length) {
                    callback(data);
                } else {
                    callback(false);
                }
            }).catch(function (err) {
                console.log('err', err);

                var $lastCarousel = $('.js-lastadded-carousel'),
                    $upsellCarousel = $('.js-upsell-carousel'),
                    $lastCarouselTab = $('.js-title-lastadded'),
                    $upsellCarouselTab = $('.js-title-upsell');

                $upsellCarousel.addClass('hidden-carousel'),
                    $lastCarouselTab.closest('.title').hide();
                if( $.trim($lastCarousel.html()).length ) {
                    $lastCarouselTab.closest('.title').show();
                    $lastCarouselTab.addClass('active');
                    $lastCarousel.removeClass('hidden-carousel');
                }
            });
        })
        .fail(function() {
            return false;
        })
}

function checkoutModalUpsellsAddToCart(status, id) {
    CartJS.addItem(id, 1, {
        "success": function (data, textStatus, jqXHR) {
            $('#modalCheckout').data('cart',JSON.stringify(CartJS));

        },
        "error": function (jqXHR, textStatus, errorThrown) {
        }
    });
}

function checkoutModalRemoveItem(lineNumber) {
    modalCheckoutPreAjax();
    CartJS.removeItem(lineNumber,{
        "success": function(data, textStatus, jqXHR) {
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            modalCheckoutPostAjax();
            $('#modalError .modal-body p').text(errorThrown);
            $('#modalError').modal('show');
        }
    })
}

/*---------------------END MODAL CHECKOUT-----------------------------*/

function add_to() {
    _this = $(this);
    $form=_this.closest('form');
    var line_properties = getFormData($('[name*=properties]',$form));
    CartJS.addItem(_this.data("variant-id"), 1, line_properties, {
        "success": function (data, textStatus, jqXHR) {
            if (_this.length) {
                if($('body').hasClass('checkout-popup'))
                {
                    setTimeout(function () {
                        _this.html("<i class='icon icon-check'></i><span>" + locales.added + "</span>");
                        showCheckoutModal();
                    }, 1000);
                    setTimeout(function () {
                        _this.html("<span>" + _this.attr("title") + "</span>");
                        _this.removeClass('btn-loading');
                        $('.js-add-to-cart').removeClass('disabled');
                    }, 2000);
                }else{
                    setTimeout(function () {
                        _this.html("<i class='icon icon-check'></i><span>" + locales.added + "</span>");
                        $('.product-item-cart span','.product-item.product-id-'+_this.data("variant-id")).html(CartJS.cart.item_count);
                        $('.product-item-cart','.product-item.product-id-'+_this.data("variant-id")).removeClass('hidden');
                    }, 1000)
                    setTimeout(function () {
                        _this.html("<span>" + _this.attr("title") + "</span>");
                        _this.removeClass('btn-loading');
                        $('.js-add-to-cart').removeClass('disabled');
                    }, 2000)
                }
            }
        },
        "error": function (jqXHR, textStatus, errorThrown) {
            setTimeout(function () {
                _this.html("<span>" + _this.attr("title") + "</span>");
            }, 2000)
            $('#modalError .modal-body p').text('No more products');
            $('#modalError').modal('show');
        }
    });
    CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
}

function updateData($type,$id,$options){

    path='product_options_'+$id;
    product_to_update=$('.product-info-block-id-'+$id);
    $price_format=price_format;

    $($type,$options).each(function(){
        if($type=='select') val=$(this).val(); else val=$(this).data('value');
        x='[\''+val+'\']';
        path+=x;
    });
    if(eval(path)!=undefined){
        /*variant changer*/
        $('input[name=id]',product_to_update).val(eval(path+'[\'id\']'));

        /*add to cart button update for checkout modal*/
        $('.js-add-to-cart-product-page',product_to_update).attr('data-variant-id',eval(path+'[\'id\']'));

        /*price changer*/
        $('.special-price',product_to_update).html(Shopify.formatMoney(eval(path+'[\'price\']'), $price_format));
        /*price changer*/

        if(eval(path+'[\'compare_at_price\']')!='')
            $('.old-price',product_to_update).html(Shopify.formatMoney(eval(path+'[\'compare_at_price\']'), $price_format));
        else $('.old-price',product_to_update).html('');

        /*sku changer*/
        sku=eval(path+'[\'sku\']');
        if(sku == '')sku = '----'
        $('.product-sku span',product_to_update).html(sku);


        /*image changer*/
        path_image=path+'[\'image\']';
        var $image = $('.main-image.id_'+$id+' img');
        var $previewsCarousel = $('#previewsGallery'+$id);
        imgSrc = eval(path_image);
        if ($previewsCarousel.length) {
            var currentSelect = imgSrc.split('?').pop();
            $previewsCarousel.find('.slick-slide').each(function () {
                if ($(this).attr('data-zoom-image').split('?').pop() == currentSelect) {
                    $(this).trigger('click');
                    return false;
                }
            })
        }
        var newImg = document.createElement("img");
        newImg.src = imgSrc;
        newImg.onload = function () {
            $image.attr('src', imgSrc);
            $image.attr('data-zoom-image', imgSrc);
        }

        /*stock changer*/
        path_inventory_management = eval(path + '[\'inventory_management\']');
        path_inventory_quantity = eval(path + '[\'inventory_quantity\']');
        path_inventory_policy = eval(path + '[\'inventory_policy\']');
        if (path_inventory_management == 'shopify' && path_inventory_policy == 'deny') {
            $('.stock-dynamic',product_to_update).removeClass('hidden').find('b').text(path_inventory_quantity);
            $('.qty-input',product_to_update).attr('data-max', path_inventory_quantity);
            if (parseInt($('.qty-input',product_to_update).val()) > parseInt(path_inventory_quantity)) {
                $('.qty-input',product_to_update).val(path_inventory_quantity);
            }
        } else {
            if (!$('.stock-dynamic',product_to_update).hasClass('hidden'))$('.stock-dynamic',product_to_update).addClass('hidden');
            $('.qty-input',product_to_update).removeAttr('data-max');
        }
    }
    currencyUpdate();
}

if($('body').hasClass('ajax_cart'))
{
    $(document).on('click','.js-add-to-cart',function(e){
        $('.js-add-to-cart').addClass('disabled');
        $(this).addClass('btn-loading').blur().html('<i class="icon icon-spinner3 spin"></i><span>'+locales.adding+'</span>');
        add_to.call(this);
        e.preventDefault();
    });

    $(document).on('click','.js-add-to-cart-product-page',function(e){
        _this = $(this);
        $form=_this.closest('form');

        if($form.formValidate()){
            var line_properties = getFormData($('[name*=properties]',$form));
            _this.addClass('btn-loading').addClass('disabled').blur().html('<i class="icon icon-spinner3 spin"></i><span>'+locales.adding+'</span>');
            CartJS.addItem($('input[name=id]',$form).val(), $('[name=quantity]',$form).val(),line_properties, {
                "success": function(data, textStatus, jqXHR) {
                    if($('.js-add-to-cart-product-page').length){

                        if($('body').hasClass('checkout-popup'))
                        {
                            setTimeout(function () {
                                _this.html("<i class='icon icon-check'></i><span>" + locales.added + "</span>");
                                showCheckoutModal();
                            }, 1000);
                            setTimeout(function () {
                                _this.removeClass('btn-loading').removeClass('disabled');
                                _this.html("<span>" + _this.attr("title") + "</span>");
                            }, 2000);
                        }else{
                            setTimeout(function(){
                                _this.removeClass('btn-loading').removeClass('disabled');

                                $('.product-item-cart span','.product-actions.product-id-'+_this.data("variant-id")).html(CartJS.cart.item_count);
                                $('.product-item-cart','.product-actions.product-id-'+_this.data("variant-id")).removeClass('hidden');
                            },1000)
                            setTimeout(function(){
                                _this.html("<span>" + _this.attr("title") + "</span>");
                            },2000)
                            setTimeout(function(){
                                $('.toggleStack').click();
                            },3000)
                        }
                    }
                },
                "error": function(jqXHR, textStatus, errorThrown) {
                    _this.removeClass('btn-loading').removeClass('disabled');
                    setTimeout(function () {
                        _this.html("<span>" + _this.attr("title") + "</span>");
                    }, 2000);
                    setTimeout(function(){
                        $('.toggleStack').click();
                    },3000);

                    $('#modalError .modal-body p').text('No more products');
                    $('#modalError').modal('show');
                }
            });
            CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
        }
        else{

        }


        e.preventDefault();
    })


    /*$(document).on('click','.js-add-to-cart',function(e){
     $('.js-add-to-cart').addClass('disabled');
     })*/
}

function cartPopupUpdate(){
    $cart_count=$('.header-cart .badge');
    $title_count=$('.header-cart .title_count');
    cart_list='ul.minicart-product-items';
    if(CartJS.cart.item_count > 0)
    {

        $('.header-cart .info').show();
        $('.header-cart').removeClass('header-cart-empty');
        $('.header-cart .empty-text').hide();
        $cart_subtotal=$('.header-cart .minicart-total .price');
        $price_format=price_format;
        $updated_list='<div class="options_title">';
        line_item=1;
        $.each(CartJS.cart.items, function(index, item) {
            variant_title='';
            properties='';
            $.each(item.properties, function(a, b) {
                if(b!="")
                {
                    properties=properties+'<div class="options_title">'+a+': '+b+'</div>';
                }
            });
            if(item.variant_title != 'Default' && item.variant_title != undefined){variant_title=item.variant_title}
            $item='<li class="minicart-product-item"> <div class = "minicart-product-row"><a class = "minicart-product-item-photo" href="'+item.url+'" title="'+item.product_title+'"> <img src = "'+item.image+'" alt="'+item.product_title+'"> </a> <div class = "minicart-product-item-details"> <div class = "minicart-product-item-info"> <h2 class="product-title"><a href="'+item.url+'" title="'+item.product_title+'">'+item.product_title+'</a></h2><div class="options_title">'+variant_title+'</div>'+properties+'</div> <div class = "minicart-product-item-qty"> <label class="label">'+locales.qty+'</label> <span> '+item.quantity+'</span> </div> <div class = "minicart-product-item-price"> <div class="product-price">'+Shopify.formatMoney(item.price, $price_format)+'</div> </div> <div class = "minicart-product-item-actions"> <a href = "'+item.url+'" data-variant-id="'+item.variant_id+'"  title="'+locales.remove+'" class="icon icon-trash-alt js-minicart-remove-item" data-line-number="'+line_item+'"></a> <a href = "'+item.url+'" title="'+locales.edit+'" class="icon icon-pencil"></a> </div> </div> </div> </li> ';
            $updated_list=$updated_list+$item;
            line_item=line_item+1;
        });
        $(cart_list).html($updated_list);
        $cart_subtotal.html(Shopify.formatMoney(CartJS.cart.total_price, $price_format));
        currencyUpdate();
    }
    else
    {
        $updated_list='';
        $(cart_list).html($updated_list);
        $('.header-cart .info').hide();
        $('.header-cart').addClass('header-cart-empty');
        $('.header-cart .empty-text').show();
    }
    $cart_count.html(CartJS.cart.item_count);
    $title_count.html(CartJS.cart.item_count);
}
function currencyUpdate(){
    if(jQuery('.selected-currency:first').length)
    {
        Currency.convertAll(shopCurrency, jQuery('.selected-currency:first').text());
    }
}

$(document).on('click','a.js-minicart-remove-item',function(e){
    CartJS.removeItem($(this).data('line-number'),{
        "success": function(data, textStatus, jqXHR) {
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError .modal-body p').text(errorThrown);
            $('#modalError').modal('show');
        }
    })
    e.preventDefault();
})
$(document).on('click','.update_qty',function(e){
    CartJS.updateItemById($(this).data('variant-id'), $(this).prev().val(),{},{
        "success": function(data, textStatus, jqXHR) {
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError .modal-body p').text(errorThrown);
            $('#modalError').modal('show');
        }
    });
    e.preventDefault();
})
$(document).on('cart.requestComplete', function(event, cart) {

    if(CartJS.cart.item_count == 0) {
        $('.page-header').data('cartopen', false)
    }
    cartPopupUpdate();
    modalCheckoutUpdate();
    currencyUpdate();
    /*$('.js-add-to-cart').removeClass('disabled');*/
});


function showProduct(delay,effect,selector){
    var delay = delay,
        effect = effect;
    $(selector).each(function(i) {
        var $this = $(this);
        setTimeout(function(){
            $this.addClass(effect + ' animated');
        }, delay*i);
    });
}

function viewMode(viewmode) {
    var $grid = $('.grid-view', $(viewmode)),
        $list = $('.list-view', $(viewmode)),
        $products = $('.products-listview, .products-grid');
    if ($('.products-listview').length){
        $list.addClass('active');
    } else if ($('.products-grid').length){
        $grid.addClass('active');
    } else return false;
    $grid.on("click", function (e) {
        var $this = $(this);
        $products.addClass('no-animate');
        if(!$this.is('.active')){
            $list.removeClass('active');
            $this.addClass('active');
            $products.removeClass('products-listview').addClass('products-grid');
        }
        setTimeout(function() {
            $products.removeClass('no-animate');
        }, 500);
        e.preventDefault();
    });
    $list.on("click", function (e) {
        var $this = $(this);
        $products.addClass('no-animate');
        if(!$this.is('.active')){
            $grid.removeClass('active');
            $this.addClass('active');
            $products.removeClass('products-grid').addClass('products-listview');
        }
        setTimeout(function() {
            $products.removeClass('no-animate');
        }, 500);
        e.preventDefault();
    });
}

function tooltipIni() {
    var title;
    $('[data-tooltip]').darkTooltip({
        size: 'small',
        animation: 'fade'
    }).hover(function () {
        title = $(this).attr('title');
        $(this).attr('title', '');
    }, function () {
        $(this).attr('title', title);
    });
}

function countDownIni(countdown) {
    $(countdown).each(function () {
        var countdown = $(this);
        var promoperiod;
        if (countdown.attr('data-promoperiod')) {
            promoperiod = new Date().getTime() + parseInt(countdown.attr('data-promoperiod'), 10);
        } else if (countdown.attr('data-countdown')) {
            promoperiod = countdown.attr('data-countdown');
        }
        if (Date.parse(promoperiod) - Date.parse(new Date()) > 0) {
            countdown.countdown(promoperiod, function (event) {
                countdown.html(event.strftime('<span><span class="left-txt">LEFT</span><span>%D</span>DAYS</span>' + '<span><span>%H</span>HRS</span>' + '<span><span>%M</span>MIN</span>' + '<span><span>%S</span>SEC</span>'));
            });
        }
    });
}
function renderPluralSingle(statement){
    var statement = statement;
    $('[data-text-plural]').each(function(){
        var $this = $(this),
            $target = $('.'+ $this.attr('data-count')),
            count = parseInt($target.html(),10),
            statementArray = statement.split(','),
            statementString = '';
        $.each(statementArray, function (index, value) {
            if($.isNumeric(value.substring(0))){
                statementString += 'count==' + value
            } else {
                statementString += 'count' + value
            }
            if (index !== (statementArray.length - 1)) {
                statementString += '||'
            }
        });
        if (eval(statementString)){
            $this.html($this.data('text-plural'))
        } else {
            $this.html($this.data('text-single'))
        }
    })
}



/*--------------------------------SHOPIFY theme.js-----------------------------------*/

window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];

    $(document)
        .on('shopify:section:load', this._onSectionLoad.bind(this))
        .on('shopify:section:unload', this._onSectionUnload.bind(this))
        .on('shopify:section:select', this._onSelect.bind(this))
        .on('shopify:section:deselect', this._onDeselect.bind(this))
        .on('shopify:block:select', this._onBlockSelect.bind(this))
        .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};



theme.customerTemplates = (function() {

    function initEventListeners() {
        // Show reset password form
        $('#RecoverPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });

        // Hide reset password form
        $('#HideRecoverPasswordLink').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });
    }

    /**
     *
     *  Show/Hide recover password form
     *
     */
    function toggleRecoverPasswordForm() {
        $('#RecoverPasswordForm').toggleClass('hide');
        $('#CustomerLoginForm').toggleClass('hide');
    }

    /**
     *
     *  Show reset password success message
     *
     */
    function resetPasswordSuccess() {
        var $formState = $('.reset-password-success');

        // check if reset password form was successfully submited.
        if (!$formState.length) {
            return;
        }

        // show success message
        $('#ResetSuccess').removeClass('hide');
    }

    /**
     *
     *  Show/hide customer address forms
     *
     */
    function customerAddressForm() {
        var $newAddressForm = $('#AddressNewForm');

        if (!$newAddressForm.length) {
            return;
        }

        // Initialize observers on address selectors, defined in shopify_common.js
        if (Shopify) {
            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
                hideElement: 'AddressProvinceContainerNew'
            });
        }

        // Initialize each edit form's country/province selector
        $('.address-country-option').each(function() {
            var formId = $(this).data('form-id');
            var countrySelector = 'AddressCountry_' + formId;
            var provinceSelector = 'AddressProvince_' + formId;
            var containerSelector = 'AddressProvinceContainer_' + formId;

            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
                hideElement: containerSelector
            });
        });



        $('.address-edit-toggle').on('click', function() {
            var formId = $(this).data('form-id');
            $('#EditAddress_' + formId).toggleClass('hide');
        });

        $('.address-delete').on('click', function() {
            var $el = $(this);
            var formId = $el.data('form-id');
            var confirmMessage = $el.data('confirm-message');

            // eslint-disable-next-line no-alert
            if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
                Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
            }
        });
    }

    /**
     *
     *  Check URL for reset password hash
     *
     */
    function checkUrlHash() {
        var hash = window.location.hash;

        // Allow deep linking to recover password form
        if (hash === '#recover') {
            toggleRecoverPasswordForm();
        }
    }

    return {
        init: function() {
            checkUrlHash();
            initEventListeners();
            resetPasswordSuccess();
            customerAddressForm();
        }
    };
})();

theme.init = function() {
    theme.customerTemplates.init();


};
$(function(){
    $(theme.init);
    $('.address-new-toggle').on('click', function() {
        $('#AddressNewForm').toggleClass('hide');
    });
})