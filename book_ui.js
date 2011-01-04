// $Id$
/*
 * @todo
 *  refactor sidebarSliding
 *  paging
 *  navSlider
 */
(function ($) {

/**
 * Implementation of Drupal.behaviors for dashboard.
 */
Drupal.behaviors.book_ui = {
  attach: function (context, settings) {
    //Drupal.behaviors.book_ui.navSlider();
    Drupal.behaviors.book_ui.paging();
    Drupal.behaviors.book_ui.sidebarSliding();
  },

  /**
   * Desc
   */
  navSlider: function () {
    var content = $(".node-book .content");
    var body = $(".node-book .content .field-name-body"); 
    var nav_menu = $(".block-book .menu li");
    var node_url = Drupal.settings.base_url + '/node/';
    var url = Drupal.settings.base_url + '/book_ui/load/';

    var slider = $("<div id='nav_slider'></div>").insertAfter(content).slider({
      min: 1,
      max: nav_menu.length,
      range: "min",
      value: 1,
      stop: function(event, ui) {
        var item = $(nav_menu[ui.value]).find("a");
        var text = item.text();
        var href = item.attr("href");
        var position = href.lastIndexOf('/') + 1;
        var nid = href.substring(position);

        $.post(url + nid, function(data) {
          content.html(data);
          // @todo: handle new url
          //parent.location.hash = nid;
        });
      }
    });
  },

  /**
   * Desc
   */
  paging: function () {
    // @todo: substring for words instead of chars
    var content = $(".node-book .content");
    var body = $(".node-book .content .field-name-body .field-item");

    var original_height = content.height();
    var new_height = $(window).height() - 100;
    var pages_num = Math.ceil(original_height / new_height);
    var num_words = jQuery.trim(body.text()).split(' ').length;
    var words_per_page = Math.ceil(num_words / pages_num);

    body.hide();
    content.append("<div class=\"pages-scroller\"><div class=\"items\"></div></div>");
    var items = content.find(".items");

    var i = 0;
    for (i = 0; i < pages_num; i++) {
      items.append("<div>" + body.text().substring((words_per_page * i), words_per_page) + "</div>");
    }

    $(".node-book .content .field-name-body").remove();

    //content.height($(window).height() - 100);

    $(window).resize(function(){
      content.height($(window).height() - 100);
    });
  },

  /**
   * Desc
   */
  sidebarSliding: function() {
    var sidebar = $(".sidebar");
    $("#main").append('<div class="sidebar-toggle"></div>');
    var sidebar_toggle = $(".sidebar-toggle");
    var content = $(".node-type-book .region-content");

    // Add init values to sidebar_toggle
    sidebar_toggle.addClass("left-arrow");
    sidebar_toggle.css("top", Math.ceil(sidebar.height() / 2) - 50);
    // @todo: what about first sidebar from right?
    sidebar_toggle.css("left", sidebar.find(".section").width());

    sidebar_toggle.click(function() {
      sidebar.toggle("slide", { direction: "left" }, 200);

      // if not sidebar is not hidden, hide it
      if (sidebar_toggle.css("left") == "0px") {
        sidebar_toggle.css("left", sidebar.find(".section").width());
        sidebar_toggle.removeClass("right-arrow");
        sidebar_toggle.addClass("left-arrow");

        Drupal.behaviors.setDimensions(content, content.height(), content.width() - sidebar.width());
      }
      else {
        sidebar_toggle.css("left", "0px");
        sidebar_toggle.removeClass("left-arrow");
        sidebar_toggle.addClass("right-arrow");

        Drupal.behaviors.setDimensions(content, content.height(), content.width() + sidebar.width());
      }
    });
  },

  /**
   * Set content height and width to the most suitable value
   */
  setDimensions: function(element, height, width) {
    $(element).height(height);
    $(element).width(width);
  },
};

})(jQuery);