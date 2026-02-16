export default function PropertyManagement() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto">

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-[#0d121b]">
            Property Management
          </h1>
          <p className="text-[#4c669a] mt-1">
            Manage and track your portfolio assets.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20">
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {properties.map((property, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#cfd7e7] overflow-hidden shadow-sm hover:shadow-xl transition-all group">

            <div
              className="h-40 bg-cover bg-center"
              style={{ backgroundImage: `url(${property.image})` }}
            ></div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-[#0d121b]">
                {property.name}
              </h3>

              <p className="text-xs text-[#4c669a] mb-4">
                {property.location}
              </p>

              <div className="flex justify-between text-sm font-semibold">
                <span>{property.units}</span>
                <span>{property.status}</span>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

const properties = [
  {
    name: "Grand Plaza Office Tower",
    location: "Downtown NY",
    units: "245 Units",
    status: "Active",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
  },
  {
    name: "Blue Water Residences",
    location: "Miami",
    units: "120 Apts",
    status: "Active",
    image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
  },
];
