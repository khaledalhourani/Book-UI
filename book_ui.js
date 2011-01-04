// $Id$
/*
 * @todo
 *  paging fix bugs on resize
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
    Drupal.behaviors.book_ui.actions();
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
   * Divide a long book page into several pages
   */
  paging: function () {
    var content = $(".node-book .content");

    var body = $(".node-book .content .field-name-body");
    if (body.length == 0) {
      body = $(".node-book .content .items");
    }

    var original_height = content.height();
    var new_height = $(window).height() - ($("#content").height() - original_height);
    var pages_count = Math.floor(original_height / new_height);

    var words = body.getWords();
    var words_count = words.length;
    var words_per_page = Math.ceil(words_count / pages_count);

    body.remove();

    content.append("<div class=\"pages-scroller\"><div class=\"items\"></div></div>");
    var items = content.find(".items");

    var words_counter = 0;
    for (i = 0; i < pages_count; i++) {
      var text_per_page = "<p>";
      for (j = 0; j < words_per_page; j++) {
        text_per_page += words[words_counter++] + " ";
      }
      text_per_page += "</p>";
      items.append(text_per_page);
    }
  },

  /**
   * Provides a sliding sidebar
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

        Drupal.behaviors.book_ui.setDimensions(content, content.height(), content.width() - sidebar.width());
      }
      else {
        sidebar_toggle.css("left", "0px");
        sidebar_toggle.removeClass("left-arrow");
        sidebar_toggle.addClass("right-arrow");

        Drupal.behaviors.book_ui.setDimensions(content, content.height(), content.width() + sidebar.width());
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

  /**
   * Actions events
   */
  actions: function() {
    $(window).resize(function() {
      Drupal.behaviors.book_ui.paging();
    });

    $(".fonts-widget-button").click(function() {
      Drupal.behaviors.book_ui.paging();
    });
  },
};

jQuery.fn.getWords = function() {
  return jQuery.trim(this.html().replace(/<\/?[^>]+>/gi, '')).split(' ');
};

})(jQuery);