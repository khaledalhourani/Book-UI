// $Id$
/*
 * @todo
 *  paging fix bugs on window resize
 *  navSlider
 */
(function ($) {

/**
 * Implementation of Drupal.behaviors for dashboard.
 */
Drupal.behaviors.book_ui = {
  attach: function (context, settings) {
    //Drupal.behaviors.book_ui.navSlider();
    Drupal.behaviors.book_ui.init();
    Drupal.behaviors.book_ui.actions();
    Drupal.behaviors.book_ui.paging();
    Drupal.behaviors.book_ui.sidebarSliding();
    Drupal.behaviors.book_ui.mouseWheel();
  },

  init: function() {
    content = ".node-book .content";
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

    if ($(".node-book .content .field-name-body").length > 0) {
      // original content, get the height directly
      content_height = content.height();
      // add fake content, remove it first if there is an old fake content
      $(".node-book #fake_content").remove();
      $(".node-book").append("<div id=\"fake_content\">" + content.html() + "</div>");
      $(".node-book #fake_content").hide();
    }
    else {
      // we can't get the height directly, because cycle changed it
      // so get it from the fake content
      content_height = $(".node-book #fake_content").height();
    }

    // Calculate pages & words per page based on container div height
    var window_height = $(window).height() - $("#content .not-content").height();
    var pages_count = Math.floor(content_height / window_height);
    var words = content.getWords();
    var words_count = words.length;
    var words_in_page = Math.floor(words_count / pages_count);
    var remainder = words_count % pages_count;

    content.empty();
    content.html("<div class=\"pages-scroller\"><div class=\"items\"></div></div>");
    var items = content.find(".items");

    var index = 0;
    for (i = 0; i < pages_count; i++) {
      var text_per_page = "<div class=\"part\"><p>";
      // if there is a remainder it'll be 1, otherwise won't affect the loop
      // upper bound
      for (j = 0; j < words_in_page + remainder; j++) {
        if (typeof words[index] != "undefined") {
          text_per_page += words[index++] + " ";
        }
      }
      text_per_page += "</div></p>";
      items.append(text_per_page);
    }

    $(".items").height(Math.floor(window_height));

    // Pager settings
    $(".pages-scroller").prepend("<div class=\"book-ui-pager\" id=\"pager-right\"></div>").append("<div class=\"book-ui-pager\" id=\"pager-left\"></div>");

    $(".book-ui-pager").css("top", Math.floor(window_height) / 2 + "px");
    $("#pager-right").css("right", "20px");
    $("#pager-left").css("left", "20px");

    $(".items").cycle({
      fx: 'scrollHorz',
      timeout: 0,
      nowrap: true,
      next: '#pager-left',
      prev: '#pager-right',
    });
  },

  /**
   * Provides a sliding sidebar
   */
  sidebarSliding: function() {
    var sidebar = $(".sidebar");
    $("#main").append('<div class="sidebar-toggle"></div>');
    var sidebar_toggle = $(".sidebar-toggle");
    var content = $(".node-book .content");

    // Add init values to sidebar_toggle
    sidebar_toggle.addClass("left-arrow");
    sidebar_toggle.css("top", 50);
    // @todo: what about first sidebar from right?
    sidebar_toggle.css("left", sidebar.find(".section").width());

    sidebar_toggle.click(function() {
      sidebar.toggle("slide", { direction: "left" }, 200);

      // if left is 0, the sidebar is hidden, slide it out
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

    $(".sidebar-toggle").click(function() {
      Drupal.behaviors.book_ui.paging();
    });
  },

  /**
   * Adds mouse wheel support to the pager
   */
  mouseWheel: function() {
    $(content).bind('mousewheel', function(event, delta, deltaX, deltaY) {
      // @todo: do we need horizontal delta?
      var pager_item = (delta == 1) ? "#pager-right" : "#pager-left";
      // trigger click event on the proper pager item
      $(pager_item).click();
      // prevent scrolling default behaviour
      event.preventDefault();
      event.stopPropagation();
    });
  },
};

$.fn.getWords = function() {
  return jQuery.trim(this.text()).split(' ');
};

$.fn.cycle.transitions.scrollHorz = function($cont, $slides, opts) {
  $cont.css('overflow','hidden').width();
  opts.before.push(function(curr, next, opts, fwd) {
    fwd = !fwd;  //  RTL
    $.fn.cycle.commonReset(curr, next, opts);
    opts.cssBefore.left = fwd ? (next.cycleW-1) : (1-next.cycleW);
    opts.animOut.left = fwd ? -curr.cycleW : curr.cycleW;
  });
  opts.cssFirst = { right: 0 };
  opts.cssBefore= { top: 0 };
  opts.animIn   = { left: 0 };
  opts.animOut  = { top: 0 };
};

})(jQuery);