"use strict";
const slugify = require("slugify");
const toSlug = (text = "") => slugify(text.replace(/[^\p{L}\p{N}]+/gu, " "), { lower: true });

const GRADES = ["MS", "G9", "G10", "G11", "G12"];
const TIMINGS = [
    "Mon L1",
    "Mon L2",
    "Mon Aft",
    "Tue L1",
    "Tue L2",
    "Tue Aft",
    "Wed L1",
    "Wed L2",
    "Wed Aft",
    "Thu L1",
    "Thu L2",
    "Thu Aft",
    "Fri L1",
    "Fri L2",
    "Fri Aft",
];
const bitToStr = (src, arr, allIsNA = false) => {
    if (allIsNA && src === (1 << arr.length) - 1) {
        return "N/A";
    }
    const r = [];
    for (let i = 0; i < arr.length && src; i++) {
        if (src & 1) r.push(arr[i]);
        src >>= 1;
    }
    return r.join(", ");
};

const $form = $("form"),
    $res = $("#discover-results");
$form.slideform({
    nextButtonText: "Next",
    submitButtonText: "Submit",
    validate: true,
    submit: async () => {
        $form.find(".slideform-btn-next, .slideform-btn-submit").prop("disabled", true);
        const formData = {};
        $form.find("input:checked").each((_, ele) => {
            const $ele = $(ele);
            const name = $ele.prop("name");
            switch (name) {
                case "grade":
                case "timing":
                    formData[name] = formData[name] || 0;
                    formData[name] += parseInt($ele.val());
                    break;
                case "tags":
                    formData[name] = formData[name] || [];
                    formData[name].push($ele.val());
                    break;
            }
        });
        $res.removeClass("no-results").empty();
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        const activities = await $.getJSON("activities.min.json");
        activities.forEach((activity) => {
            const intersectTags = activity.tags.filter((tag) => formData.tags.includes(tag));
            if (!activity.grade & formData.grade || !activity.timing & formData.timing || !intersectTags.length) {
                return;
            }
            const $div = $("<div>").addClass("activity-card");
            $div.append(
                $("<h3>").text(activity.name),
                $("<p>").text(activity.description),
                $("<p>").text(`Grade: ${bitToStr(activity.grade, GRADES)}`),
                $("<p>").text(`Timing: ${bitToStr(activity.timing, TIMINGS, true)}`),
                $("<p>").text(`Tags: ${intersectTags.join(", ")}`),
            );
            $div.on("click", () => {
                window.open(`https://www.slawuwc.org/activities/${toSlug(activity.name)}`);
            });
            $res.append($div);
        });
        if (!$res.children().length) {
            $res.addClass("no-results").append("<h3>No results :(</h3><p>Try again with looser constraints?</p>");
        }
        $form.find(".slideform-btn-next, .slideform-btn-submit").prop("disabled", false);
        $form.trigger("goForward");
    },
});
