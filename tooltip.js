function LoadToolTips() {
  var refreshTooltip = false;

  if (localStorage.getItem('Tooltips') === null) {
    refreshTooltip = true;
  }
  if (localStorage.getItem('TooltipRefreshDate') === null) {
    localStorage.setItem('TooltipRefreshDate', new Date());
    refreshTooltip = true;
  } else {
    var now = new Date();
    var refreshDate = new Date(localStorage.getItem('TooltipRefreshDate'));
    var msBetweenDates = Math.abs(refreshDate.getTime() - now.getTime());
    var hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);

    if (hoursBetweenDates >= 24) {
      localStorage.setItem('TooltipRefreshDate', now);
      refreshTooltip = true;
    }
  }

  if (refreshTooltip) {
    $.ajax({
      url: 'https://tooltips.obsres.com/ToolTip/GetAll',
      type: 'GET',
      headers: {
        MyCustomHeader: 'important information',
      },
      success: function (result) {
        localStorage.setItem('Tooltips', JSON.stringify(result));
        ParseTooltips(result);
      },
    });
  } else {
    var result = JSON.parse(localStorage.getItem('Tooltips'));
    ParseTooltips(result);
  }
}

function ParseTooltips(result) {
  $('div.ob-tooltip').remove();

  var pathName = window.location.pathname;

  if (result.data) {
    var parsedUrl = result.data.filter(function (item) {
      return item.Enabled === true && item.Url === pathName;
    });

    parsedUrl.forEach(function (item, index) {
      if (item.Enabled) {
        var element = null;
        var float = 'left';
        var topPosition = 0;
        var iconType = 'fa-question-circle fa-lg';
        var iconStyle = '';
        var leftPosition = 0;
        var zIndex = 1;

        if (item.IconType === 'Asterisk') {
          iconType = 'fa-asterisk fa-sm';
          iconStyle = 'font-size: 9px;';
          leftPosition = -8;
        } else {
          leftPosition = -18;
        }

        if (item.Setting_LeftOffset) {
          leftPosition += item.Setting_LeftOffset;
        }

        if (item.Setting_Position === 1) {
          float = 'right';
        }

        if (item.Setting_ZIndex) {
          zIndex = item.Setting_ZIndex;
        }

        if (item.IsJQuerySelector) {
          element = $(item.JQuerySelector);
        } else if (item.ElementID) {
          element = $(`#${item.ElementID}`);
        } else if (item.ElementName) {
          element = $(`[name='${item.ElementName}']`);
        } else if (item.Href && item.OnClick) {
          element = $(
            `a[href='${item.Href}'][onclick*='${item.OnClick.replace(
              /'/g,
              "\\'"
            )}']`
          );
        }

        if (!element || !element.length > 0) {
          return;
        }

        var parent = element.parent();

        if (element.is('a') || element.is('span') || element.is(':radio')) {
        } else {
          var bottomDist = 0;
          var elems = element.nextAll();
          if (elems.length > 0) {
            elems.each(function (i, elem) {
              var elemHeight = $(elem).outerHeight(true);

              if ($(elem).is('label')) {
                return;
              }

              if ($(elem).is(':checkbox')) {
                bottomDist += 35;
              } else if (elemHeight === 0) {
                bottomDist += 15.5;
              } else {
                bottomDist += elemHeight;
              }
            });
          }

          if (item.Setting_TopOffset) {
            topPosition += item.Setting_TopOffset;
          }
        }

        var icon = `<div class="ob-tooltip" style="position: relative; display: inline-block; float: ${float}; zoom: 1; cursor: pointer;">
                                <div style="position: absolute; display: inline; left: ${leftPosition}px; top: ${topPosition}px; z-index: ${zIndex};">
                                    <i class ="fa ${iconType}" aria-hidden="true" data-toggle="tooltip" title="${item.TipDescription}" style="color: #337ab7;${iconStyle}"></i>
                                </div>
                            </div>`;

        if (element.is('a') || element.is('span')) {
          $(element).append(icon);
        } else {
          if (float == 'left') {
            $(icon).insertBefore(element);
          } else {
            $(parent).append(icon);
          }
        }
      }
    });

    $(document).ready(function () {
      $('[data-toggle="tooltip"]').tooltip({
        placement: 'top',
        container: 'body',
        html: true,
      });
    });
  }
}

$(document).ready(function () {
  $(document).on('click', function () {
    setTimeout(function () {
      LoadToolTips();
    }, 2000);
  });

  LoadToolTips();
});
