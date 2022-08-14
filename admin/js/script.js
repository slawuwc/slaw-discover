"use strict";

let unsaved = false;

const $activityTable = $("#activityTable");
const rowTemplate = (id, activity = {}) => {
    const $tr = $("<tr>");
    const $gradeBtn = $(`<input type="image" class="form-control-sm grade-btn" src="img/edit.svg" id="grade${id}" aria-label="Edit grade" />`).data(
            "grade",
            activity.grade || 0,
        ),
        $timingBtn = $(`<input type="image" class="form-control-sm timing-btn" src="img/edit.svg" id="timing${id}" aria-label="Edit timing" />`).data(
            "timing",
            activity.timing || 0,
        ),
        $tagsBtn = $(`<input type="image" class="form-control-sm tags-btn" src="img/edit.svg" id="tags${id}" aria-label="Edit tags" />`).data(
            "tags",
            activity.tags || [],
        );
    $tr.append([
        `<td><input type="text" class="form-control activity-name" id="name${id}" aria-label="Name ${id}" value="${activity.name || ""}" /></td>`,
        `<td><textarea type="text" class="form-control activity-description" id="description${id}" aria-label="Description ${id}" rows="1">${
            activity.description || ""
        }</textarea></td>`,
        $("<td>").append($gradeBtn),
        $("<td>").append($timingBtn),
        $("<td>").append($tagsBtn),
        `<td>
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-primary activity-add">+</button>
                <button type="button" class="btn btn-outline-primary activity-remove" disabled>-</button>
            </div>
        </td>`,
    ]);
    return $tr;
};
const removeEmptyRows = () =>
    $activityTable
        .find("tr")
        .filter(
            (_, row) =>
                !$(row).find(".activity-name").val().trim() &&
                !$(row).find(".activity-description").val().trim() &&
                !$(row).find(".grade-btn").data("grade") &&
                !$(row).find(".timing-btn").data("timing") &&
                // !$(row).find(".tags-btn").data("tags")?.filter(Boolean).length,
                !$(row).find(".tags-btn").data("tags")?.length,
        )
        .remove();

const $file = $("#activityFile");
const reader = new FileReader();
reader.onload = () => {
    const data = JSON.parse(reader.result);
    if (!Array.isArray(data) || !data.length) {
        return;
    }
    removeEmptyRows();
    data.forEach((activity) => {
        $activityTable.append(rowTemplate(++rowCount, activity));
    });
    $(".activity-remove").prop("disabled", false);
};
$file.on("change", () => {
    const file = $file.prop("files")[0];
    reader.readAsText(file);
});

const $activityList = $("#activityList"),
    $activityListBtn = $("#activityListBtn");
$activityListBtn.on("click", () => {
    const activities = $activityList
        .val()
        .split(/\r?\n/)
        .map((v) => v.trim())
        .filter(Boolean);
    if (!activities.length) {
        return;
    }
    removeEmptyRows();
    const curActivities = $activityTable
        .find(".activity-name")
        .map((_, e) => $(e).val().trim())
        .get();
    activities.forEach((activity) => {
        if (curActivities.includes(activity)) {
            return;
        }
        $activityTable.append(rowTemplate(++rowCount, { name: activity }));
    });
});

let rowCount = 1;
$(document).on("click", ".activity-add", () => {
    $activityTable.append(rowTemplate(++rowCount));
    $(".activity-remove").prop("disabled", false);
});
$(document).on("click", ".activity-remove", (e) => {
    $(e.target).closest("tr").remove();
    $(".activity-remove").prop("disabled", --rowCount == 1);
});

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
const TAGS = [
    "arts",
    "stem",
    "econs",
    "literature",
    "history",
    "chinese",
    "publications",
    "entertainment",
    "leadership",
    "others",
    "visual-art",
    "music",
    "photography",
    "other-arts",
    "science",
    "coding",
    "engineering",
    "math",
];
const editModal = new bootstrap.Modal("#editModal");
const $editModal = $("#editModal"),
    $editProperty = $("#editProperty"),
    $editName = $("#editName"),
    $editContent = $("#editContent"),
    $editSave = $("#editSave");
// const tagsTemplate = (tag = "") =>
//     `<div class="row gx-3 mb-2"><div class="col-9"><input type="text" class="form-control" value="${tag}" /></div><div class="btn-group col-2" role="group"><button type="button" class="btn btn-outline-primary tags-add">+</button><button type="button" class="btn btn-outline-primary tags-remove" disabled>-</button></div></div>`;
$(document).on("click", ".grade-btn, .timing-btn, .tags-btn", (e) => {
    const $btn = $(e.target);
    $editModal.data("caller", $btn);
    $editContent.empty();
    if ($btn.hasClass("grade-btn")) {
        $editModal.data("state", "grade");
        $editProperty.text("grade");
        const thisGrade = $btn.data("grade") || 0;
        $editContent.append(
            GRADES.map(
                (grade, i) =>
                    `<div class="form-check"><input class="form-check-input" name="grade" type="checkbox" value="${1 << i}" id="grade-${i}" ${
                        (thisGrade >> i) & 1 ? "checked" : ""
                    }><label class="form-check-label" for="grade-${i}">${grade}</label></div>`,
            ),
        );
    } else if ($btn.hasClass("timing-btn")) {
        $editModal.data("state", "timing");
        $editProperty.text("timing");
        const thisTiming = $btn.data("timing") || 0;
        $editContent.append(
            TIMINGS.map(
                (timing, i) =>
                    `<div class="form-check"><input class="form-check-input" name="timing" type="checkbox" value="${1 << i}" id="timing-${i}" ${
                        (thisTiming >> i) & 1 ? "checked" : ""
                    }><label class="form-check-label" for="timing-${i}">${timing}</label></div>`,
            ),
        );
    } else if ($btn.hasClass("tags-btn")) {
        $editModal.data("state", "tags");
        $editProperty.text("tags");
        // const thisTags = $btn.data("tags") || [""],
        //     tagsNum = thisTags.length;
        // $editModal.data("tags-num", tagsNum);
        // $editContent.append(thisTags.map(tagsTemplate));
        // $(".tags-remove").prop("disabled", tagsNum == 1);
        const thisTags = $btn.data("tags") || [];
        $editContent.append(
            TAGS.map(
                (tag, i) =>
                    `<div class="form-check"><input class="form-check-input" name="timing" type="checkbox" value="${tag}" id="tag-${i}" ${
                        thisTags.includes(tag) ? "checked" : ""
                    }><label class="form-check-label" for="tag-${i}">${tag}</label></div>`,
            ),
        );
    }
    $editName.text($btn.closest("tr").find(".activity-name").val());
    editModal.show();
});
// $(document).on("click", ".tags-add", () => {
//     $editContent.append(tagsTemplate());
//     $editModal.data("tags-num", $editModal.data("tags-num") + 1);
//     $(".tags-remove").prop("disabled", false);
// });
// $(document).on("click", ".tags-remove", (e) => {
//     $(e.target).closest(".row").remove();
//     const tagsNum = $editModal.data("tags-num") - 1;
//     $editModal.data("tags-num", tagsNum);
//     $(".tags-remove").prop("disabled", tagsNum == 1);
// });
$editSave.on("click", () => {
    const { state, caller } = $editModal.data();
    switch (state) {
        case "grade":
        case "timing":
            caller.data(
                state,
                $editContent
                    .find("input:checked")
                    .map((_, ele) => parseInt($(ele).val()))
                    .get()
                    .reduce((s, a) => s + a, 0),
            );
            break;
        case "tags":
            // caller.data(
            //     state,
            //     $editContent
            //         .find("input")
            //         .map((_, ele) => $(ele).val().trim())
            //         .get()
            //         .filter(Boolean),
            // );
            caller.data(
                state,
                $editContent
                    .find("input:checked")
                    .map((_, ele) => $(ele).val())
                    .get(),
            );
            break;
    }
    unsaved = true;
});

$("#download").on("click", () => {
    const activities = [];
    $activityTable.find("tr").each((_, row) => {
        const $row = $(row);
        const name = $row.find(".activity-name").val().trim(),
            description = $row.find(".activity-description").val().trim(),
            grade = $row.find(".grade-btn").data("grade") || 0,
            timing = $row.find(".timing-btn").data("timing") || 0,
            tags = $row.find(".tags-btn").data("tags") || [];
        if (!name && !description && !grade && !timing && !tags.length) {
            return;
        }
        activities.push({ name, description, grade, timing, tags });
    });
    const data = JSON.stringify(activities);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activities.json";
    a.click();
    URL.revokeObjectURL(url);
});

window.onbeforeunload = () => {
    if (
        []
            .concat(
                $activityTable.find(".activity-name").map((_, e) => $(e).val().trim()),
                $activityTable.find(".activity-description").map((_, e) => $(e).val().trim()),
                $activityTable.find(".grade-btn").map((_, e) => $(e).data("grade")),
                $activityTable.find(".timing-btn").map((_, e) => $(e).data("timing")),
                // $activityTable.find(".tags-btn").map((_, e) => $(e).data("tags").filter(Boolean)).length,
                $activityTable.find(".tags-btn").map((_, e) => $(e).data("tags")).length,
            )
            .filter(Boolean).length
    ) {
        return true;
    }
};
