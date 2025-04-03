const SelectDivisionDropdown = ({selectedDivision, handleDivisionFilter}) => {
    return (
        <div className="division-dropdown">
<label className="text-tBase">Select Division:</label>
              <select
                id="division-select"
                name="divisions"
                value={selectedDivision}
                onChange={handleDivisionFilter}
                className="bg-primary text-tBase rounded-lg border-2 border-borderPrimary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option className="bg-primary hover:bg-hovPrimary" value="">
                  All Divisions
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="mahalunge"
                >
                  Mahalunge
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="chakan"
                >
                  Chakan
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="dighi_alandi"
                >
                  Dighi-Alandi
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="bhosari"
                >
                  Bhosari
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="talwade"
                >
                  Talwade
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="pimpri"
                >
                  Pimpri
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="chinchwad"
                >
                  Chinchwad
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="nighdi"
                >
                  Nighdi
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="sanghvi"
                >
                  Sanghvi
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="hinjewadi"
                >
                  Hinjewadi
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="wakad"
                >
                  Wakad
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="bavdhan"
                >
                  Bavdhan
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="dehuroad"
                >
                  Dehuroad
                </option>
                <option
                  className="bg-primary hover:bg-hovPrimary"
                  value="talegaon"
                >
                  Talegaon
                </option>
              </select>
        </div>
    );
};

export default SelectDivisionDropdown;