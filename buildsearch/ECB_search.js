// Functions for the build search page.
// Assumes the folowing have been defined (see e.g. ECB_config.js):
//     NUM_CLASSES
//     MAX_CHARACTER_LEVEL
//     MIN_CHARACTER_LEVEL


// Current values of the class selectors.
// (These are "previous" when they get used in the onChanged event.)
var PreviousValues = new Array("");
for ( var i=1; i<= NUM_CLASSES; i++ )
    PreviousValues.push("any");


// Converts its parameter to a number, but defaults to 0
// if the result is not a finite number.
function FiniteNumber(num_str)
{
    if ( isFinite(num_str) )
        return Number(num_str);
    return 0;
}


// Keeps the minimum and maximum level totals updated
// The parameter should be "min" or "max".
function LevelTotal(minmax)
{
    // Find the relevant total.
    var total_display = document.getElementById(minmax + "total");
    if ( total_display )
    {
        // Calculate the total.
        var total = 0;
        for ( var i=1; i<= NUM_CLASSES; i++ )
        {
            var entry = document.getElementById(minmax + i);
            total += ( entry ? Number(entry.value) : 0 );
        }

        // Update the display.
        total_display.value = total;
        if ( ( total > MAX_CHARACTER_LEVEL  &&  minmax == "min" ) ||
             ( total < MIN_CHARACTER_LEVEL  &&  minmax == "max" ) )
            total_display.style.color="#FF0000";
        else
            total_display.style.color="";
    }
}


// Keeps the minimum and maximum level totals updated, as well as
// validating the value of changed.
// The changed parameter should be the form element that changed.
function LevelValidate(changed)
{
    // Safety check.
    if ( !changed )
        return;

    // Make sure the changed element has a number in the range 0 to 40.
    var was_finite = isFinite(changed.value); // Might need this later.
    changed.value = FiniteNumber(changed.value);
    if ( changed.value > MAX_CHARACTER_LEVEL )
        changed.value = MAX_CHARACTER_LEVEL;
    else if ( changed.value < 0 )
        changed.value = 0;

    // Identify the changed element as a min or max.
    var minmax =  changed.id ? changed.id.substring(0,3) : "";

    // Enforce max >= min.
    if ( minmax == "min" )
    {
        // Check the max.
        var max_el = document.getElementById("max" + changed.id.substring(3));
        if ( max_el  &&  Number(changed.value) > Number(max_el.value) )
        {
            // Increase the max to accommodate this change.
            max_el.value = changed.value;
            LevelTotal("max");
        }
    }
    else
    {
        // Check the min.
        var min_el = document.getElementById("min" + changed.id.substring(3));
        if ( min_el  &&  Number(changed.value) < Number(min_el.value) )
        {
            // Only decrease the min if this was valid input originally.
            if ( was_finite )
            {
                min_el.value = changed.value;
                LevelTotal("min");
            }
            else
                // Probably an input error. Set changed down to minimum.
                changed.value = min_el.value;
        }
    }

    // Update the relevant total.
    LevelTotal(minmax);
}


// Converts a class name to the id of the associated checkbox.
function ClassToBox(class_name)
{
    try {
        var prefix = class_name.substring(0,3);
        if ( prefix == "arc" ) // Arcane tricksters messed up my system.
            return prefix + class_name.charAt(7) + "_box";
        else
            return prefix + class_name.charAt(class_name.length-1) + "_box";
    }
    catch (e) { }

    // Bad input? GIGO it.
    return "null_box";
}


// Controls the visibility of the class selection panel.
// Also sets min/max to 0 if "changed" was changed to "none".
function ClassValidate(changed)
{
    // Safety check.
    if ( !changed )
        return;

    // Gather some data about _changed_.
    var changed_index_string = changed.id ? changed.id.substring(5) : "";
    var changed_index        = FiniteNumber(changed_index_string);
    var changed_value        = changed.value;
    var prev_value           = PreviousValues[changed_index];

    // Some data culled from _changed_ and the rest of the page.
    var flag_selected =  changed_value == "selected";
    var flag_matched = false;
    for ( i=1; i <= NUM_CLASSES; i++ )
        if ( i != changed_index )
        {
            // Locate the value of the i-th class selection.
            var select = document.getElementById("class"+i);
            select = select ? select.value : "";

            // Update flags.
            flag_selected = flag_selected || select == "selected";
            flag_matched  = flag_matched  || select == changed_value;
        }
    // Handle a bizarre case better.
    if ( changed_value == "" )
        flag_matched = false;

    // Re-enable a button that might have been disabled.
    try { document.getElementById(ClassToBox(prev_value)).disabled = false; }
    catch (e) { } // Just making sure this does not break execution.

    // Check for something changing to "none".
    if ( changed_value == "none" )
    {
        // Set this class' max levels to 0.
        var max_el = document.getElementById("max" + changed_index_string);
        if ( max_el )
        {
            max_el.value = 0;
            LevelValidate(max_el);
        }
    }
    // Check for something changing to "any" or "selected".
    else if ( changed_value == "any"  ||  changed_value == "selected" )
        // Nothing special for these cases.
        ;
    else
    {
        // Specific class selected. Prohibit choosing the same class twice.
        if ( flag_matched )
        {
            alert("You cannot select the same class twice.");
            changed.value = changed_value = prev_value;
            // Update flags.
            if ( changed_value == "selected" )
                flag_selected = true;
        }
        // Disable the check box for this class.
        var checkbox = document.getElementById(ClassToBox(changed_value));
        if ( checkbox )
        {
            checkbox.checked = false;
            checkbox.disabled = true;
        }
    }

    // Remember this value for when this is next changed.
    // (Must be done after the specific-class validation.)
    PreviousValues[changed_index] = changed_value;

    // Update the visibility of the class selection panel.
    var classset = document.getElementById("classset");
    if ( classset )
        classset.style.display = flag_selected ? "block" : "none";
}


// Co-ordinates the "any race" button with the rest of the buttons.
// The parameter is the button that was just checked or unchecked.
function AllRaces(button)
{
    if ( button.name == "allrace" )
    {
        var check_it = button.checked;

        // Make the other race buttons match this one's state.
        var button_list = document.getElementsByTagName("INPUT");
        var index = button_list.length;
        while ( index-- > 0 )
            if ( "selrace" == button_list[index].name )
                // Found a race button.
                button_list[index].checked = check_it;
    }
    else if ( button.checked )
    {
        var all_selected = true;

        // A race selection has been made; if all races are now
        // selected, have the "all races" button mirror that.
        var button_list = document.getElementsByTagName("INPUT");
        var index = button_list.length;
        while ( all_selected  &&  index-- > 0 )
            if ( "selrace" == button_list[index].name )
                // Found a race button.
                all_selected = button_list[index].checked;
        // Set/unset the "all races" button as appropriate.
        // (Inside a _try_ in case the button is not found.)
        try { document.getElementById("allracebutton").checked = all_selected; } catch (e) {}
    }
    else
        // A race selection has been cleared, so make sure the
        // "all races" button is not selected.
        // (Inside a _try_ in case the button is not found.)
        try { document.getElementById("allracebutton").checked = false; } catch (e) {}
}


// Handles the submission of the search form.
function ValidateSearch()
{
    // Warn if minimum total is too high.
    var total_display = document.getElementById("mintotal");
    if ( total_display  &&  Number(total_display.value) > MAX_CHARACTER_LEVEL )
        alert("Your criteria implies a build with more than " + MAX_CHARACTER_LEVEL +
              " levels. Such a build is illegal, so getting no search results is likely.");

    // Warn if maximum total is too low.
    total_display = document.getElementById("maxtotal");
    if ( total_display  &&  Number(total_display.value) < MIN_CHARACTER_LEVEL )
        alert("Your criteria implies a build with less than " + MIN_CHARACTER_LEVEL +
              " levels. Such builds are uncommon, so getting no search results is likely.");

    // Warn if not enough classes selected for "selected classes".
    var num_selected_slots = 0;
    for ( i=1; i <= NUM_CLASSES; i++ )
    {
        var select = document.getElementById("class"+i);
        if ( select  &&  select.value == "selected" )
            num_selected_slots++;
    }
    if ( num_selected_slots > 0 )
    {
        var num_selections = 0;

        // Iterate through all inputs (including class buttons).
        var button_list = document.getElementsByTagName("INPUT");
        var index = button_list.length;
        while ( index-- > 0 )
            // See if we found a class button.
            if ( "selclass" == button_list[index].name  &&  button_list[index].checked )
                // Count this.
                num_selections++;

        // See if any classes are selected.
        if ( 0 == num_selections )
            alert('You chose "selected classes", but did not select any. ' +
                  'This will probably result in no search results.');
        else if ( num_selections < num_selected_slots )
            alert('You chose "selected classes" ' + num_selected_slots + ' times, ' +
                  'but only selected ' + num_selections + ' class' +
                  (num_selections == 1 ? '' : 'es') + '. ' +
                  'This will probably result in no search results.');
    }

    // Show the results panel.
    document.getElementById("resultsframe").style.display = "block";
}

