(function () {
    $(".pop-row").popover({
        trigger: "hover",
        placement: "left",
        html: true,
        container: "body",
        title: "Row (blue)",
        content: function () {
            var $th = $(this);
            return "Facts about " + $th.find("td").eq(0).text() + ".";
        }
    });

    $(".pop-col").popover({
        trigger: "hover",
        html: true,
        container: "body",
        title: "Column (pink)",
        content: function () {
            var $td = $(this);
            var $th = $td.closest("table").find("th").eq($td.index());
            //console.log($td.parent("table"));
            return "<strong>Name</strong>: " + $th.text() + "<br />"
                + "Tracks " + $th.data("name") + " across many states.<br />"
                + "Can hold " + $th.data("type");
        },
        placement: "top"
    });
})();