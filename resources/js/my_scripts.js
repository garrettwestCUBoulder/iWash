function machine_wash_options() {
	if (document.getElementById('machine_wash').checked) {
		document.getElementById('wash_temp').style = 'display:visible';
		document.getElementById('wash_cycle').style = 'display:visible';
	}
	else {
		document.getElementById('wash_temp').style = 'display:none';
		document.getElementById('wash_cycle').style = 'display:none';
	}
}

  function myFunction() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("mylist");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[2];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }
  function myFunction1() {
    var input2, filter2, table, tr, td, i;
    input2 = document.getElementById("mylist1");
    filter2 = input2.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td2 = tr[i].getElementsByTagName("td")[1];
      if (td2) {
        txtValue = td2.textContent || td2.innerText;
        if (txtValue.toUpperCase().indexOf(filter2) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }
