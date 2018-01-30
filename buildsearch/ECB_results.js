// Functions for the build search results page.
// Assumes the folowing have been defined (see e.g. ECB_config.js):
//     NUM_CLASSES
//     RACE_RE
//     TopicNumToURL()
//
// Class "names" that have special meanings:
//     any, none, selected, used


// ------------- Constructors -------------


// Constructs an object, to be used in a filter array, that is associated
// with build. This is basically a light-weight clone of build or a true
// clone of another filter.
function FilterRec(build)
{
    this.topicNum = build.topicNum;
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        this["class" + i] = build["class" + i];
        this["level" + i] = build["level" + i];
    }
}


// Constructs an object, to be used to store a criterium for searching.
function CriteriumRec(class_name, min_level, max_level)
{
    this.myclass = class_name;
    this.mymin = min_level;
    this.mymax = max_level;
}


// ------------- Utilities -------------


// Converts its paramter to a number, but defaults to 0
// if the result is not a finite number.
function FiniteNumber(num_str)
{
    if ( isFinite(num_str) )
        return Number(num_str);
    return 0;
}


// Checks to see if item matches an element of list (an array).
function IsInList(item, list)
{
    // Iterate through the list.
    var index = list ? list.length : 0;
    while ( index-- > 0 )
        if ( item == list[index] )
            return true;

    // Not found.
    return false;
}


// Checks to see if the class/level combo at position class_pos in filter
// matches criterion, with class_list used if criterion.myclass is not "any".
// This assumes the criterion is only for "any" or "selected" and the filter
// contains a matchable class/level combo. (In particular, the specified
// class and level are to be defined.)
function IsMultiMatch(filter, class_pos, criterion, class_list)
{
    // Levels outside the specified range do not match.
    var level = filter["level" + class_pos];
    if ( level < criterion.mymin  ||  criterion.mymax < level )
        return false;

    // Check if this class is one of the selected (or if we accept any).
    // (Done last for efficiency.)
    return criterion.myclass == "any"  ||
           IsInList(filter["class" + class_pos], class_list);
}


// Takes an array of builds and returns a corresponding array of filters.
function BuildsToFilters(build_list)
{
    var filters = new Array();

    // Loop through the build list.
    var i = build_list.length;
    while ( i-- > 0 )
        filters.push(new FilterRec(build_list[i]));

    return filters;
}


// ------------- Sorters -------------


// Comparison function for sorting builds by author.
function AuthorSorter(a, b)
{
    var keyA = a.author.toLowerCase();
    var keyB = b.author.toLowerCase();

    // Primary sort by author.
    if ( keyA < keyB )
        return -2;
    if ( keyA > keyB )
        return 2;

    // Secondary sort by topicNum (as strings).
    if ( a.topicNum < b.topicNum )
        return -1;
    if ( a.topicNum > b.topicNum )
        return 1;

    return 0;
}


// Comparison function for sorting builds by classes.
function ClassSorter(a, b)
{
    var keyA = null;       var keyB = null;

    // Primary sort by class (independent of order within a build).
    keyA = new Array();    keyB = new Array();
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        keyA.push(a["class" + i].toLowerCase());
        keyB.push(b["class" + i].toLowerCase());
    }
    keyA.sort();           keyB.sort();
    keyA = keyA.join("");  keyB = keyB.join("");
    if ( keyA < keyB )
        return -4;
    if ( keyA > keyB )
        return 4;

    // Secondary sort by class order within a build.
    keyA = "";    keyB = "";
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        keyA += a["class" + i].toLowerCase();
        keyB += b["class" + i].toLowerCase();
    }
    if ( keyA < keyB )
        return -3;
    if ( keyA > keyB )
        return 3;

    // Tertiary sort by level of the classes in the order within a build.
    keyA = 0;    keyB = 0;
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        keyA = 100*keyA + Number(a["level" + i]); // Recall: "9" > "10".
        keyB = 100*keyB + Number(b["level" + i]); // Recall: "9" > "10".
    }
    if ( keyA < keyB )
        return -2;
    if ( keyA > keyB )
        return 2;

    // Final sort by topicNum (as strings).
    if ( a.topicNum < b.topicNum )
        return -1;
    if ( a.topicNum > b.topicNum )
        return 1;
    return 0;
}


// Comparison function for sorting builds by class levels.
function ClassLevelSorter(a, b)
{
    var keyA = null;       var keyB = null;

    // Primary sorts: classes in order by level.
    keyA = new Array();    keyB = new Array();
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        keyA.push( (99 - Number(a["level" + i])) + // Need fixed length and decreasing.
                   a["class" + i].toLowerCase());
        keyB.push( (99 - Number(b["level" + i])) + // Need fixed length and decreasing.
                   b["class" + i].toLowerCase());
    }
    keyA.sort();                           keyB.sort();
    for ( var i = 0; i < NUM_CLASSES; i++ )
    {
        // Priority to name of class with (next) most levels.
        var subkeyA = keyA[i].substring(2);
        var subkeyB = keyB[i].substring(2);
        if ( subkeyA < subkeyB )
            return -(2 + 2*NUM_CLASSES - 2*i);
        if ( subkeyA > subkeyB )
            return   2 + 2*NUM_CLASSES - 2*i;

        // Next comes the level of that class.
        var subkeyA = keyA[i].substring(0,2);
        var subkeyB = keyB[i].substring(0,2);
        if ( subkeyA < subkeyB )
            return -(1 + 2*NUM_CLASSES - 2*i);
        if ( subkeyA > subkeyB )
            return   1 + 2*NUM_CLASSES - 2*i;
    }

    // Secondary sort by class order within a build.
    keyA = "";    keyB = "";
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        keyA += a["class" + i].toLowerCase();
        keyB += b["class" + i].toLowerCase();
    }
    if ( keyA < keyB )
        return -2;
    if ( keyA > keyB )
        return 2;

    // Final sort by topicNum (as strings).
    if ( a.topicNum < b.topicNum )
        return -1;
    if ( a.topicNum > b.topicNum )
        return 1;
    return 0;
}


// Comparison function for sorting builds by class levels.
/* -- Replaced, but kept in case it might be useful again.
function OldClassLevelSorter(a, b)
{
    var keyA = null;       var keyB = null;

    // Primary sort by class (independent of order within a build).
    keyA = new Array();    keyB = new Array();
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        keyA.push(a["class" + i].toLowerCase());
        keyB.push(b["class" + i].toLowerCase());
    }
    keyA.sort();           keyB.sort();
    keyA = keyA.join("");  keyB = keyB.join("");
    if ( keyA < keyB )
        return -4;
    if ( keyA > keyB )
        return 4;

    // Secondary sort by levels of the classes (classes in alphabetic order).
    keyA = new Array();    keyB = new Array();
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        keyA.push(a["class" + i].toLowerCase() +
                  ( 10 + Number(a["level" + i]) )); // Because "9" > "10".
        keyB.push(b["class" + i].toLowerCase() +
                  ( 10 + Number(b["level" + i]) )); // Because "9" > "10".
    }
    keyA.sort();          keyB.sort();
    keyA = keyA.join(""); keyB = keyB.join("");
    if ( keyA < keyB )
        return -3;
    if ( keyA > keyB )
        return 3;

    // Tertiary sort by class order within a build.
    keyA = "";    keyB = "";
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        keyA += a["class" + i].toLowerCase();
        keyB += b["class" + i].toLowerCase();
    }
    if ( keyA < keyB )
        return -2;
    if ( keyA > keyB )
        return 2;

    // Final sort by topicNum (as strings).
    if ( a.topicNum < b.topicNum )
        return -1;
    if ( a.topicNum > b.topicNum )
        return 1;
    return 0;
}
*/


// Comparison function for sorting builds by topic number.
function TopicSorter(a, b)
{
    // Remember to treat topic numbers as strings!
    // (Non-digit characters are used when there are multiple builds in a topic).
    if ( a.topicNum < b.topicNum )
        return -1;
    if ( a.topicNum > b.topicNum )
        return 1;
    return 0;
}


// ------------- Filters (searchers) -------------


// Removes the builds of build_list that are "deleted" and standardizes
// "unknown" race names. Returns the resulting array.
// The original array is unchanged.
function ValidBuilds(build_list)
{
    var new_list = new Array();

    // Iterate through build_list.
    var index_length = build_list.length;
    var index = -1;
    while ( ++index < index_length )
    {
        var build = build_list[index];

        // Skip "deleted" builds.
        if ( "" != build.author )
        {
            // Standardize missing races.
            if ( build.race != "any"  &&  !RACE_RE.test(build.race) )
                build.race = "unknown";

            new_list.push(build);
        }
    }

    return new_list;
}


// Removes the builds of build_list that are "deleted" and whose race
// does not match the one in race_list. Returns the resulting array.
// The original array is unchanged.
function RaceBuilds(build_list, race_list)
{
    var new_list = new Array();

    // Determine if unrecognized races are to be included.
    var check_unknown = IsInList("unknown", race_list)

    // Iterate through build_list.
    var index_length = build_list.length;
    var index = -1;
    while ( ++index < index_length )
    {
        var build = build_list[index];

        // Skip "deleted" builds.
        if ( "" != build.author )
        {
            // See if the race matches.
            if ( check_unknown  &&  !RACE_RE.test(build.race) )
            {
                if ( build.race != "any" )
                    build.race = "unknown";
                new_list.push(build);
            }
            else if ( IsInList(build.race, race_list) )
                new_list.push(build);
        }
    }

    return new_list;
}


// Returns a filter list (array) built from list_filter enforcing
// class class_name has between min_level and max_level levels.
function ClassNameFilter(list_filter, class_name, min_level, max_level)
{
    var new_list = new Array();

    // Iterate through list_filter;
    var index_length = list_filter.length;
    var index = -1;
    while ( ++index < index_length )
    {
        var filter = list_filter[index];

        // Check for this class being present.
        var position = NUM_CLASSES + 1;
        while ( --position > 0 )
            if ( class_name == filter["class" + position] )
                break;

        // If we found the class.
        if ( position > 0 )
        {
            if ( min_level <= filter["level" + position]  &&
                 filter["level" + position] <= max_level )
            {
                // We have a match!
                var new_filter = new FilterRec(filter);
                new_filter["class" + position] = "used";
                new_list.push(new_filter);
            }
        }
        // Else if no levels is a possibility.
        else if ( min_level == 0 )
        {
            var new_filter = new FilterRec(filter);
            new_list.push(new_filter);
        }
    }//while (index)

    return new_list;
}


// Returns a filter list (array) built from list_filter enforcing the
// "selected" and "any" criteria (if any) listed in classes (with min/max
// level criteria supplied in mins amd maxs). The allowed classes for
// "selected" are those in class_list.
function ClassMultiFilter(list_filter, classes, mins, maxs, class_list)
{
    var criteria = new Array();

    // Determine which of the NUM_CLASSES criteria are "any"/"selected".
    for ( var i = 1; i <= NUM_CLASSES; i++ )
        if ( "any" == classes[i]  ||  "selected" == classes[i] )
            criteria.push(new CriteriumRec(classes[i], mins[i], maxs[i]));
    // Do nothing if no "any"/"selected" criterion found.
    if ( criteria.length == 0 )
        return list_filter;

    var new_list = new Array();

    // Iterate through list_filter.
    var index_length = list_filter.length;
    var index = -1;
    while ( ++index < index_length )
    {
        var filter = list_filter[index];

        // Get a list of class positions that match the criteria.
        var class_match = DoMultiSearch(filter, criteria, 1, class_list,
                                        CanMatchZeroSelected(filter, class_list));
        if ( class_match != null )
        {
            // This was a match; record it.
            var new_filter = new FilterRec(filter);
            var i = class_match.length;
            while ( i-- > 0 )
                new_filter["class" + class_match[i]] = "used";
            new_list.push(new_filter);
        }
    }

    return new_list;
}


// Returns true if class_list contains a class not appearing in filter.
function CanMatchZeroSelected(filter, class_list)
{
    // Get a list of classes appearing in filter.
    var class_tracker = new Object();
    for ( var i = 1; i <= NUM_CLASSES; i++ )
    {
        var class_name = filter["class" + i];
        // Ignore used and non-existent class slots.
        if ( class_name  &&  class_name != "used"  &&  class_name != "" )
            // Track this.
            class_tracker[class_name] = true;
    }

    var j = class_list.length;
    if ( j == 0 )
        // Probably no selected criteria anyway, but still... it does match I guess.
        return true;

    // Look for an unused class from the list.
    while ( j-- > 0 )
        if ( !class_tracker[class_list[j]] )
            return true;

    // All classes in class_list appear in filter.
    return false;
}


// Checks to see if filter matches criteria, considering only the classes in position
// class_pos and higher.
// class_list is an array of class names used when the criterium is "selected".
// allow_zero_selected is a boolean indicating if a "selected" criterium can be matched
// with zero levels.
// Returns an array of class positions that match the criteria (possibly zero-length).
// Returns null if filter does not match criteria.
function DoMultiSearch(filter, criteria, class_pos, class_list, allow_zero_selected)
{
    // Check for "underflow".
    if ( criteria.length == 0 )
        // Matching no criteria is easy.
        return new Array();

    // Check for "overflow".
    if ( class_pos > NUM_CLASSES )
    {
        // We can only match the criteria if all min levels are zero.
        for ( var i = 0; i < criteria.length; i++ )
            if ( criteria[i].mymin > 0 )
                return null;
            else if ( !allow_zero_selected  &&  criteria[i].myclass == "selected" )
                // Not a match.
                return null;
        // All criteria allow zero levels, so we are fine.
        return new Array();
    }

    // Make sure this class position can be matched to something.
    var class_name = filter["class" + class_pos];
    if ( filter["level" + class_pos]  &&  class_name  &&  class_name != "used" )
    {
        // Check each criterion against this class position.
        var crit_num = criteria.length;
        while ( crit_num-- > 0 )
            if ( IsMultiMatch(filter, class_pos, criteria[crit_num], class_list) )
            {
                // Potential match. Check the remaining criteria.
                var saved_crit = criteria.splice(crit_num, 1);
                var class_match = DoMultiSearch(filter, criteria, class_pos+1,
                                                class_list, allow_zero_selected);
                // Restore the array.
                criteria.splice(crit_num, 0, saved_crit[0]);

                if ( class_match != null )
                {
                    // Matched!
                    class_match.push(class_pos);
                    return class_match;
                }
            }
    }

    // This class did not match, but maybe we don't need to?
    // Check the remaining classes against all the criteria.
    return DoMultiSearch(filter, criteria, class_pos+1, class_list, allow_zero_selected);
}


// Returns a filter list (array) resulting from removing those elements of
// list_filter that have classes that have not been claimed by earlier searches.
// (This is basically the "none" criterion enforcement.
function ClassExcessFilter(list_filter)
{
    var new_list = new Array();

    // Iterate through build_list.
    var index_length = list_filter.length;
    var index = -1;
    while ( ++index < index_length )
    {
        var filter = list_filter[index];

        // Check for any classes not claimed by earlier searches.
        var is_good = true;
        for ( var i = 1; is_good  &&  i <= NUM_CLASSES; i++ )
        {
            var class_name = filter["class" + i];
            is_good = !class_name  ||  "used" == class_name;
        }

        if ( is_good )
            // This one passes.
            new_list.push(filter);
    }

    return new_list;
}


// ------------- Other list manipulation -------------


// Produces a subarray of list that contains only the elements referenced in
// filters. In this case, "referencing" means "having the same topicNum field.
// The supplied filters and list will be sorted in the process.
function ApplyFilter(filters, list)
{
    var new_list = new Array();

    // Sort the arrays.
    filters.sort(TopicSorter);
    list.sort(TopicSorter);

    // Iterate through the arrays.
    var list_length   = list.length;
    var filter_length = filters.length;
    var list_index   = 0;
    var filter_index = 0;
    while ( list_index < list_length  &&  filter_index < filter_length )
    {
        // Skip filtered-out entries.
        while ( list_index < list_length  &&
                list[list_index].topicNum < filters[filter_index].topicNum )
            list_index++;

        // If list's element is in the filter, add it to the new list.
        if ( list_index < list_length  &&
             list[list_index].topicNum == filters[filter_index].topicNum )
            new_list.push(list[list_index]);

        // Skip redundant filters. (Safety check.)
        while ( filter_index < filter_length-1 &&
                filters[filter_index].topicNum == filters[filter_index+1].topicNum )
            filter_index++;
        // Next filter.
        filter_index++;
    }

    return new_list;
}


// Writes build_list to the document.
// Uses Sorter (a function) and grouping to determine how to group results.
// The higher grouping is the more builds get grouped together.
function WriteList(build_list, Sorter, grouping)
{
    var alternator = true;

    // For a bit of simplicity/efficiency in the loop.
    document.writeln('<div style="display:none">');

    // Iterate through the list.
    for ( var index = 0; index < build_list.length; index++ )
    {
        var build = build_list[index];

        if ( index == 0  ||  Sorter(build, build_list[index-1], build) >= grouping )
            document.writeln('</div>\n<div class="build ' +
                ( (alternator ^= true) ? 'even' : 'odd') + '">');
        else
            document.writeln('<br />');

        // Description, linked to the forum topic.
        document.write('<a class="buildlink" href="' + TopicNumToURL(build.topicNum) +
                       '" target="BuildWindow">');
        document.write(build.description);
        document.writeln('</a>');

        // Class info.
        document.write('<span class="classinfo">');
        document.write(build.class1 + " " + build.level1);
        for ( var i = 2; i <= NUM_CLASSES; i++ )
            if ( build["level" + i] > 0 )
                document.write(" / "+build["class" + i]+" "+build["level" + i]);
        document.writeln('</span>');

        // Race info.
        document.write('<span class="raceinfo">');
        document.write(" (" + build.race + ")");
        document.writeln('</span>');

        // Author info.
        document.write('<span class="authorinfo">');
        document.write(" by " + build.author);
        document.writeln('</span>');
   }
   document.writeln("</div>");
}


// ------------- Main entry point -------------


// Parses the URL parameters, performs a search, and writes the results.
function ParseParams()
{
    // The criteria
    var class_selection = new Array();
    var race_selection = new Array();
    var all_race = false;
    var mins = new Array(NUM_CLASSES+1);    // 1-based array
    var maxs = new Array(NUM_CLASSES+1);    // 1-based array
    var classes = new Array(NUM_CLASSES+1); // 1-based array
    var sortby = "";
    var i = 0;      // Used to iterate small loops.
    var tmp = null; // Storage for a value that will be used in the next statement.

    // Initialize arrays.
    for ( i = 1; i <= NUM_CLASSES; i++ )
    {
        mins[i] = 0;
        maxs[i] = 0;
        classes[i] = "none"
    }


    // ********* URL decoding *********

    // Find the relevant part of the URL.
    var url_params = "";
    var token_index = document.URL.indexOf("?");
    if ( token_index >= 0 )
        url_params = document.URL.substring(token_index + 1);

    // Un-encode spaces.
    url_params = url_params.replace(/\+/g, " ");
    url_params = url_params.replace(/_/g, " ");
    // Safety measure -- legit searches should not have these characters anyway.
    url_params = url_params.replace(/</g, "&lt;");
    url_params = url_params.replace(/>/g, "&gt;");

    // Convert the URL tail into an array of associations.
    var param_list = url_params.split("&");
    // Iterate the array.
    var criteria_found = false;
    var index = param_list.length;
    while ( index-- > 0 )
    {
        // Make sure the association is valid.
        var param = param_list[index].split("=", 2);
        if ( param.length == 2 )
        {
            var valid_param = true;
            // Set the appropriate variable.
            switch ( param[0].substring(0, 3) )
            {
                case "min":
                        tmp = Number(param[0].substring(3));
                        if ( 0 < tmp  &&  tmp <= NUM_CLASSES )
                            mins[tmp] = FiniteNumber(param[1]);
                        else
                            valid_param = false;
                        break;

                case "max":
                        tmp = Number(param[0].substring(3));
                        if ( 0 < tmp  &&  tmp <= NUM_CLASSES )
                            maxs[tmp] = FiniteNumber(param[1]);
                        else
                            valid_param = false;
                        break;

                case "cla":
                        tmp = Number(param[0].substring(5));
                        if ( 0 < tmp  &&  tmp <= NUM_CLASSES  &&  "ss" == param[0].substring(3,5))
                            classes[tmp] = param[1].length > 0 ? param[1] : "none";
                        else
                            valid_param = false;
                        break;

                default: // The non-indexed parameters.
                    switch ( param[0] )
                    {
                        case "selclass": class_selection.unshift(param[1]);   break;
                        case "selrace" : race_selection.unshift(param[1]);    break;
                        case "sortby":   sortby = param[1];                   break;
                        case "allrace":  all_race = param[1].length > 0    &&
                                           param[1].toLowerCase() != "no"  &&
                                           param[1].toLowerCase() != "false"; break;

                        default: valid_param = false;
                    }
            }//switch
            criteria_found = criteria_found || valid_param;
        }
    }//while (index)
    if ( !criteria_found )
        // No query found.
        return document.writeln('<p class="error">No valid query supplied.</p>');


    // ********* Criteria feedback ********* 

    document.write('<p class="criteria">Builds with ');

    // Classes
    for ( i = 1; i <= NUM_CLASSES; i++ )
    {
        if ( i == NUM_CLASSES )
            document.write("and ");
        if ( "none" == classes[i] )
            document.write( "no class " + i);
        else
        {
            document.write(mins[i] + " to " + maxs[i] + " levels of " + classes[i]);
            if ( "any" == classes[i] )
                document.write(" class");
            else if ( "selected" == classes[i] )
                document.write(" classes");
        }
        if ( i < NUM_CLASSES )
            document.write(", ");
        else
            document.writeln(".<br />");
    }

    // Class selection
    if ( IsInList("selected", classes) )
    {
        if ( class_selection.length == 0 )
            document.writeln('<span class="warn">No classes were selected.</span><br />');
        else
            document.writeln("The selected classes are " +
                             class_selection.join(", ") + ".<br />");
    }

    // Races
    if ( all_race  ||  race_selection.length == 0 )
        document.writeln("All races are included.<br />");
    else
        document.writeln("The included races are " + race_selection.join(", ") + ".<br />");

    // Sort order.
    document.writeln("Builds are sorted by " +
        ("classlevel" == sortby ? "class and level" : sortby) + ".</p>");


    // ********* Data retrieval ********* 

    // Get the list of builds.
    var list_text = null;
    try {
        var list_source = parent.document.getElementById("listsource");
        if ( list_source.contentDocument )
            // Most browsers.
            list_source = list_source.contentDocument.body;
        else
            // Interrupted-Education browsers
            list_source = list_source.Document.body;

        if ( list_source.textContent )
            // Most browsers.
            list_text = list_source.textContent;
        else
            // Inane-Ego browsers
            list_text = list_source.outerText;
    }
    catch (e) {
        return document.writeln('<p class="error">No database found.</p>');
    }
    var build_list = LoadList(list_text); // Will always be a valid array.


    // ********* Searching ********* 

    // Apply the racial criteria.
    if ( all_race  ||  race_selection.length == 0 )
        build_list = ValidBuilds(build_list);
    else
    {
        // Expand the race list to allow a question mark at the end.
        for ( i = race_selection.length - 1; i >= 0; i-- )
            race_selection.push(race_selection[i] + "?");
        build_list = RaceBuilds(build_list, race_selection);
    }

    // Classes:
    var list_filter = BuildsToFilters(build_list);

    // First, handle the specific classes.
    for ( i = 1; i <= NUM_CLASSES; i++ )
        if ( "none" != classes[i]  &&  "any" != classes[i]  &&  "selected" != classes[i] )
            list_filter = ClassNameFilter(list_filter, classes[i], mins[i], maxs[i]);

    // Second, handle the "selected" and "any" classes.
    list_filter = ClassMultiFilter(list_filter, classes, mins, maxs, class_selection);

    // Finally, weed out the builds with excess classes.
    // (Implies either a "none" class specified or a class allowing 0 levels.)
    list_filter = ClassExcessFilter(list_filter);

    // Apply the filters to the list to get the search results.
    build_list = ApplyFilter(list_filter, build_list);


    // ********* Sorting and display ********* 

    document.writeln('<span class="matches">Matches found: ' +
                      build_list.length + '</span><br />');

    switch ( sortby )
    {
        case "author": build_list.sort(AuthorSorter)
                       WriteList(build_list, AuthorSorter, 2);
                       break;

        case "class": build_list.sort(ClassSorter)
                      WriteList(build_list, ClassSorter, 4);
                      break;

        case "classlevel": build_list.sort(ClassLevelSorter)
                           WriteList(build_list, ClassLevelSorter, 3);
                           break;

        case "classmajor": build_list.sort(ClassLevelSorter)
                           WriteList(build_list, ClassLevelSorter, 2 + 2*NUM_CLASSES);
                           break;

        default: WriteList(build_list, TopicSorter, 1);
    }
}
