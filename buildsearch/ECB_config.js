// Configuration file for the ECB searcher.
//
// This version is for the original (NWN).

// The most classes this search expects in a build:
var NUM_CLASSES = 3;
// Some parameters for likely valid searches:
var MAX_CHARACTER_LEVEL = 40;
var MIN_CHARACTER_LEVEL = 40; // The lowest-level builds likely to be found.


// Class names in lowercase that should not be:
var BadLowerCase = new Array("champion of torm", "harper scout");
// The correct capitalization of the above:
var NonLowerCase = new Array("champion of Torm", "Harper scout");

// Detector for valid races:
var RACE_RE = /^(?:dwarf|elf|gnome|halfling|half-elf|half-orc|human)\??$/;

// Where the builds can be found:
function TopicNumToURL(topic_num)
{
    var url_prefix = "../builds/data/build";
    var url_suffix = ".html";

    // Split off any trailing '#';
    var split_point = topic_num.indexOf("#");
    var first_part  = split_point == -1 ? topic_num : topic_num.substring(0, split_point);
    var second_part = split_point == -1 ? ""        : topic_num.substring(split_point);

    return url_prefix + first_part + url_suffix + second_part;
}

