// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RealEstate {
    struct Property {
        uint256 id;
        string location;
        uint256 price;
        address owner;
    }

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties;

    event PropertyAdded(uint256 id, string location, uint256 price, address owner);
    event OwnershipTransferred(uint256 id, address newOwner);
    event PropertyPriceUpdated(uint256 id, uint256 newPrice);
    event PropertyDeleted(uint256 id);

    function addProperty(string memory _location, uint256 _price) public {
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        propertyCount++;
        properties[propertyCount] = Property(propertyCount, _location, _price, msg.sender);
        emit PropertyAdded(propertyCount, _location, _price, msg.sender);
    }

    function transferOwnership(uint256 _propertyId, address _newOwner) public {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        require(_newOwner != address(0), "New owner address cannot be zero");
        require(properties[_propertyId].owner == msg.sender, "Only the owner can transfer ownership");

        properties[_propertyId].owner = _newOwner;
        emit OwnershipTransferred(_propertyId, _newOwner);
    }

    function updatePropertyPrice(uint256 _propertyId, uint256 _newPrice) public {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        require(_newPrice > 0, "New price must be greater than zero");
        require(properties[_propertyId].owner == msg.sender, "Only the owner can update the price");

        properties[_propertyId].price = _newPrice;
        emit PropertyPriceUpdated(_propertyId, _newPrice);
    }

    function getProperty(uint256 _propertyId) public view returns (Property memory) {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        return properties[_propertyId];
    }

    function listAllProperties() public view returns (Property[] memory) {
        Property[] memory allProperties = new Property[](propertyCount);
        for (uint256 i = 1; i <= propertyCount; i++) {
            allProperties[i - 1] = properties[i];
        }
        return allProperties;
    }

    function getPropertiesByOwner(address _owner) public view returns (Property[] memory) {
        require(_owner != address(0), "Owner address cannot be zero");

        uint256 count = 0;
        for (uint256 i = 1; i <= propertyCount; i++) {
            if (properties[i].owner == _owner) {
                count++;
            }
        }

        Property[] memory ownerProperties = new Property[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= propertyCount; i++) {
            if (properties[i].owner == _owner) {
                ownerProperties[index] = properties[i];
                index++;
            }
        }
        return ownerProperties;
    }

    function getPropertyCount() public view returns (uint256) {
        return propertyCount;
    }

    function ownerOf(uint256 _propertyId) public view returns (address) {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        return properties[_propertyId].owner;
    }

    function deleteProperty(uint256 _propertyId) public {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        require(properties[_propertyId].owner == msg.sender, "Only the owner can delete the property");

        emit PropertyDeleted(_propertyId);
        delete properties[_propertyId];
        propertyCount--;
    }
}
